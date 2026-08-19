/**
 * Safaricom Daraja API client.
 *
 * Handles:
 *  - OAuth token acquisition + caching (Redis, ~55 min TTL)
 *  - STK Push initiation
 *  - STK Push query (for reconciliation)
 *  - B2C payout (partner disbursement, SPLIT mode only)
 *
 * Required env vars (platform / SPLIT mode):
 *   MPESA_CONSUMER_KEY
 *   MPESA_CONSUMER_SECRET
 *   MPESA_PAYBILL
 *   MPESA_PASSKEY
 *   MPESA_ENV          — "sandbox" | "production"
 *   MPESA_CALLBACK_BASE_URL
 *   MPESA_B2C_INITIATOR_NAME
 *   MPESA_B2C_SECURITY_CREDENTIAL
 *   MPESA_B2C_SHORTCODE
 */

import { redisGet, redisSet } from "@/lib/redis";

// ── Daraja base URLs ──────────────────────────────────────────────────────────

function baseUrl(): string {
  return process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface DarajaCredentials {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passkey: string;
}

export interface StkPushParams {
  amount: number;
  customerPhone: string; // 2547XXXXXXXX
  accountReference: string; // bookingId
  transactionDesc: string;
  paymentId: string; // used in CallbackURL
  credentials: DarajaCredentials;
}

export interface StkPushResult {
  checkoutRequestId: string;
  merchantRequestId: string;
  responseCode: string;
  responseDescription: string;
}

export interface StkQueryResult {
  resultCode: number;
  resultDesc: string;
}

export interface B2CParams {
  amount: number;
  recipientPhone: string;
  paymentId: string;
  remarks?: string;
}

export interface B2CResult {
  conversationId: string;
  originatorConversationId: string;
}

// ── OAuth token ───────────────────────────────────────────────────────────────

/**
 * Gets a Daraja OAuth bearer token.
 * Cached in Redis for 55 minutes (token expires at 60 min — 5 min buffer).
 *
 * @param cacheKey  A unique string per credential set (e.g. "platform" or partnerId)
 * @param consumerKey
 * @param consumerSecret
 */
export async function getDarajaToken(
  cacheKey: string,
  consumerKey: string,
  consumerSecret: string
): Promise<string> {
  const redisKey = `daraja-token:${cacheKey}`;
  const cached = await redisGet(redisKey);
  if (cached) return cached;

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const response = await fetch(
    `${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Daraja token request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const token: string = data.access_token;
  if (!token) throw new Error("Daraja returned no access_token");

  await redisSet(redisKey, token, 55 * 60); // 55 min TTL
  return token;
}

/** Get the platform-level Daraja token (SPLIT / B2C). */
export async function getPlatformToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY!;
  const secret = process.env.MPESA_CONSUMER_SECRET!;
  return getDarajaToken("platform", key, secret);
}

// ── STK Push ─────────────────────────────────────────────────────────────────

/** Generate a Daraja timestamp string: YYYYMMDDHHmmss */
function timestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, "")
    .slice(0, 14);
}

/** Generate the Daraja password: base64(shortcode + passkey + timestamp) */
function stkPassword(shortCode: string, passkey: string, ts: string): string {
  return Buffer.from(`${shortCode}${passkey}${ts}`).toString("base64");
}

/**
 * Initiates an M-Pesa STK push.
 * Returns the CheckoutRequestID and MerchantRequestID from Daraja.
 */
export async function stkPush(params: StkPushParams, token: string): Promise<StkPushResult> {
  const { amount, customerPhone, accountReference, transactionDesc, paymentId, credentials } =
    params;
  const { shortCode, passkey } = credentials;
  const callbackBase = process.env.MPESA_CALLBACK_BASE_URL!;

  const ts = timestamp();
  const password = stkPassword(shortCode, passkey, ts);

  const body = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: ts,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(amount), // Daraja requires an integer
    PartyA: customerPhone,
    PartyB: shortCode,
    PhoneNumber: customerPhone,
    CallBackURL: `${callbackBase}/api/mpesa/callback/${paymentId}`,
    AccountReference: accountReference.slice(0, 12), // Daraja max 12 chars
    TransactionDesc: transactionDesc.slice(0, 13),   // Daraja max 13 chars
  };

  const response = await fetch(`${baseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok || data.ResponseCode !== "0") {
    throw new Error(
      `STK push failed: [${data.ResponseCode ?? response.status}] ${data.ResponseDescription ?? data.errorMessage ?? JSON.stringify(data)}`
    );
  }

  return {
    checkoutRequestId: data.CheckoutRequestID,
    merchantRequestId: data.MerchantRequestID,
    responseCode: data.ResponseCode,
    responseDescription: data.ResponseDescription,
  };
}

// ── STK Query (reconciliation) ────────────────────────────────────────────────

/**
 * Queries the status of a previously initiated STK push.
 * Used by the reconciliation worker for payments stuck in PUSHED status.
 */
export async function stkQuery(
  checkoutRequestId: string,
  credentials: DarajaCredentials,
  token: string
): Promise<StkQueryResult> {
  const { shortCode, passkey } = credentials;
  const ts = timestamp();
  const password = stkPassword(shortCode, passkey, ts);

  const body = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: ts,
    CheckoutRequestID: checkoutRequestId,
  };

  const response = await fetch(`${baseUrl()}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await response.json();
  return {
    resultCode: Number(data.ResultCode ?? data.ResponseCode ?? -1),
    resultDesc: data.ResultDesc ?? data.ResponseDescription ?? "Unknown",
  };
}

// ── B2C Payout ────────────────────────────────────────────────────────────────

/**
 * Sends a B2C payment to a partner phone number.
 * Used by the payout worker (SPLIT mode only).
 */
export async function b2cPayment(params: B2CParams, token: string): Promise<B2CResult> {
  const { amount, recipientPhone, paymentId, remarks } = params;
  const callbackBase = process.env.MPESA_CALLBACK_BASE_URL!;

  const body = {
    InitiatorName: process.env.MPESA_B2C_INITIATOR_NAME!,
    SecurityCredential: process.env.MPESA_B2C_SECURITY_CREDENTIAL!,
    CommandID: "BusinessPayment",
    Amount: Math.round(amount),
    PartyA: process.env.MPESA_B2C_SHORTCODE!,
    PartyB: recipientPhone,
    Remarks: (remarks ?? `Payout ${paymentId}`).slice(0, 100),
    QueueTimeOutURL: `${callbackBase}/api/mpesa/b2c-callback`,
    ResultURL: `${callbackBase}/api/mpesa/b2c-callback`,
    Occasion: paymentId.slice(0, 100),
  };

  const response = await fetch(`${baseUrl()}/mpesa/b2c/v1/paymentrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok || data.ResponseCode !== "0") {
    throw new Error(
      `B2C payment failed: [${data.ResponseCode ?? response.status}] ${data.ResponseDescription ?? data.errorMessage ?? JSON.stringify(data)}`
    );
  }

  return {
    conversationId: data.ConversationID,
    originatorConversationId: data.OriginatorConversationID,
  };
}

// ── Platform credentials helper ───────────────────────────────────────────────

/** Returns platform collection credentials from env vars. */
export function getPlatformCredentials(): DarajaCredentials {
  return {
    consumerKey: process.env.MPESA_CONSUMER_KEY!,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
    shortCode: process.env.MPESA_PAYBILL!,
    passkey: process.env.MPESA_PASSKEY!,
  };
}
