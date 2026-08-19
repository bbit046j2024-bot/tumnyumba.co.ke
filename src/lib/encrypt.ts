/**
 * AES-256-GCM encryption/decryption for DIRECT-mode partner credentials.
 *
 * Credentials (passkey, consumer key, consumer secret) are encrypted before
 * being written to the database and decrypted only inside the worker route
 * immediately before a Daraja API call.
 *
 * Storage format (as a single Buffer / Prisma Bytes field):
 *   [ IV (12 bytes) | AuthTag (16 bytes) | Ciphertext (N bytes) ]
 *
 * Required env var:
 *   CREDENTIALS_ENC_KEY — exactly 32 bytes expressed as 64 hex characters
 *   Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getMasterKey(): Buffer {
  const hex = process.env.CREDENTIALS_ENC_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "CREDENTIALS_ENC_KEY must be a 64-character hex string (32 bytes). " +
        "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypts a plaintext string.
 * @returns A Buffer that can be stored directly in a Prisma `Bytes` field.
 */
export function encrypt(plaintext: string): Buffer {
  const key = getMasterKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Pack: IV || AuthTag || Ciphertext
  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Decrypts a Buffer previously produced by `encrypt()`.
 * @returns The original plaintext string.
 */
export function decrypt(buf: Buffer): string {
  const key = getMasterKey();

  if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("Encrypted buffer is too short to be valid.");
  }

  const iv = buf.subarray(0, IV_LENGTH);
  const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
