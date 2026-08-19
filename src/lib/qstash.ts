/**
 * Upstash QStash client.
 *
 * QStash replaces BullMQ: publish a message and QStash HTTP-POSTs to a
 * Vercel route with configurable retries and exponential back-off.
 * No long-lived worker process needed — zero extra infra.
 *
 * Required env vars:
 *   QSTASH_TOKEN              — publisher token
 *   QSTASH_CURRENT_SIGNING_KEY — for signature verification on worker routes
 *   QSTASH_NEXT_SIGNING_KEY    — rotated signing key (kept for overlap)
 */

import { Client, Receiver } from "@upstash/qstash";

// ── Publisher (used inside API routes to enqueue jobs) ──────────────────────

let _client: Client | null = null;

export function getQstash(): Client {
  if (!_client) {
    const token = process.env.QSTASH_TOKEN;
    if (!token) throw new Error("Missing env var: QSTASH_TOKEN");
    _client = new Client({
      token,
      ...(process.env.QSTASH_URL && { baseUrl: process.env.QSTASH_URL }),
    });
  }
  return _client;
}

// ── Receiver (used inside worker routes to verify QStash signature) ─────────

let _receiver: Receiver | null = null;

export function getQstashReceiver(): Receiver {
  if (!_receiver) {
    const current = process.env.QSTASH_CURRENT_SIGNING_KEY;
    const next = process.env.QSTASH_NEXT_SIGNING_KEY;
    if (!current || !next) {
      throw new Error(
        "Missing env vars: QSTASH_CURRENT_SIGNING_KEY and QSTASH_NEXT_SIGNING_KEY"
      );
    }
    _receiver = new Receiver({ currentSigningKey: current, nextSigningKey: next });
  }
  return _receiver;
}

// ── Helper: publish a job to a worker route ─────────────────────────────────

const BASE_URL = process.env.MPESA_CALLBACK_BASE_URL ?? process.env.NEXTAUTH_URL ?? "";

export interface PublishOptions {
  /** Delay before delivery in seconds. */
  delay?: number;
  /** Number of retries on non-2xx response. Default: 3. */
  retries?: number;
}

/**
 * Publishes a JSON payload to an internal worker route via QStash.
 *
 * @param path  - Worker route path, e.g. "/api/worker/stk-push"
 * @param body  - JSON-serialisable payload
 * @param opts  - Optional delay and retry count
 */
export async function publishJob<T extends object>(
  path: string,
  body: T,
  opts: PublishOptions = {}
): Promise<void> {
  if (!BASE_URL) {
    throw new Error(
      "Cannot publish QStash job: MPESA_CALLBACK_BASE_URL or NEXTAUTH_URL is not set."
    );
  }

  await getQstash().publishJSON({
    url: `${BASE_URL}${path}`,
    body,
    ...(opts.delay !== undefined && { delay: opts.delay }),
    retries: opts.retries ?? 3,
  });
}

// ── Helper: verify incoming QStash signature on a worker route ───────────────

/**
 * Call this at the top of every /api/worker/* route handler.
 * Returns the verified request body as a string if valid.
 * Throws an error (→ return 401) if the signature is invalid.
 */
export async function verifyQstashSignature(request: Request): Promise<string> {
  const signature = request.headers.get("upstash-signature");
  if (!signature) throw new Error("Missing upstash-signature header");

  const body = await request.text();
  const isValid = await getQstashReceiver().verify({
    signature,
    body,
  });

  if (!isValid) throw new Error("Invalid QStash signature");
  return body;
}
