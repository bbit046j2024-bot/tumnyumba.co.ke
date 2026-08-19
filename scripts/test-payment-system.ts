/**
 * Verification script for encryption and commission calculation utilities.
 * Run with: npx tsx scripts/test-payment-system.ts
 */

import { calculateCommission, partnerShare } from "../src/lib/commission";
import { encrypt, decrypt } from "../src/lib/encrypt";

// Set a dummy 64-char hex key for test if not already in env
if (!process.env.CREDENTIALS_ENC_KEY) {
  process.env.CREDENTIALS_ENC_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  ✓ ${desc}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
    failed++;
  }
}

console.log("\n=== Testing Commission Calculations ===");
// 1. Percentage commission
const c1 = calculateCommission(5000, "PERCENTAGE", 10);
assert(c1 === 500, `10% of 5000 should be 500 (got ${c1})`);

const s1 = partnerShare(5000, c1);
assert(s1 === 4500, `Partner share of 5000 with 500 commission should be 4500 (got ${s1})`);

// 2. Fixed commission
const c2 = calculateCommission(5000, "FIXED", 300);
assert(c2 === 300, `Fixed commission of 300 on 5000 should be 300 (got ${c2})`);

const s2 = partnerShare(5000, c2);
assert(s2 === 4700, `Partner share of 5000 with 300 fixed commission should be 4700 (got ${s2})`);

// 3. Fixed commission exceeding payment amount (clamping)
const c3 = calculateCommission(200, "FIXED", 300);
assert(c3 === 200, `Fixed commission of 300 on 200 payment should clamp to 200 (got ${c3})`);

const s3 = partnerShare(200, c3);
assert(s3 === 0, `Partner share on clamped commission should be 0 (got ${s3})`);

// 4. Fractional percentage
const c4 = calculateCommission(3333, "PERCENTAGE", 7.5);
assert(c4 === 249.98, `7.5% of 3333 should round to 249.98 (got ${c4})`);

console.log("\n=== Testing AES-256-GCM Encryption / Decryption ===");
const testSecret = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
const encryptedBuffer = encrypt(testSecret);
assert(encryptedBuffer instanceof Buffer, "Encryption should return a Buffer");
assert(encryptedBuffer.length > 28, "Encrypted buffer must contain IV + AuthTag + Ciphertext");

const decrypted = decrypt(encryptedBuffer);
assert(decrypted === testSecret, "Decrypted text must match the original plaintext exactly");

// Complex strings (passkeys, special chars)
const complexKey = "Ws!@#$%^&*()_+{}|:<>?~`-=[]\\;',./";
const enc2 = encrypt(complexKey);
const dec2 = decrypt(enc2);
assert(dec2 === complexKey, "Complex string with symbols should round-trip correctly");

console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);

if (failed > 0) {
  process.exit(1);
}
