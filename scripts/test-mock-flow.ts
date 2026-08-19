/**
 * Verification test for booking state transitions and calculations.
 * Run with: npx tsx scripts/test-mock-flow.ts
 */

import { calculateCommission, partnerShare } from "../src/lib/commission";

console.log("\n=== Testing Booking Payment Flow Simulation ===");

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

// 1. Booking creation with set price (F3)
const booking = {
  id: "ck-bkg-101",
  amountDue: 15000,
  amountPaid: 0,
  status: "PENDING",
};

assert(booking.amountDue === 15000, "Partner sets fixed amountDue (KSh 15,000)");

// 2. First installment: Deposit of 5000 (F5)
const installment1 = 5000;
const charge1 = Math.min(installment1, booking.amountDue - booking.amountPaid);
assert(charge1 === 5000, "Installment 1 charge is KSh 5,000");

// Process payment 1 confirmation
booking.amountPaid += charge1;
booking.status = booking.amountPaid >= booking.amountDue ? "PAID" : "PARTIALLY_PAID";

assert(booking.amountPaid === 5000, "Amount paid updated to 5,000");
assert(booking.status === "PARTIALLY_PAID", "Booking status transitioned to PARTIALLY_PAID");

// Calculate SPLIT commission on payment 1 (F6: per payment, not per booking total)
const comm1 = calculateCommission(charge1, "PERCENTAGE", 10);
const partnerPayout1 = partnerShare(charge1, comm1);
assert(comm1 === 500, "10% commission on KSh 5000 is KSh 500");
assert(partnerPayout1 === 4500, "Partner payout for payment 1 is KSh 4500");

// 3. Second installment: Remaining balance of 10,000
const remaining = booking.amountDue - booking.amountPaid;
assert(remaining === 10000, "Remaining balance is KSh 10,000");

const charge2 = remaining;
booking.amountPaid += charge2;
booking.status = booking.amountPaid >= booking.amountDue ? "PAID" : "PARTIALLY_PAID";

assert(booking.amountPaid === 15000, "Amount paid updated to 15,000");
assert(booking.status === "PAID", "Booking status transitioned to PAID");

const comm2 = calculateCommission(charge2, "PERCENTAGE", 10);
const partnerPayout2 = partnerShare(charge2, comm2);
assert(comm2 === 1000, "10% commission on KSh 10,000 is KSh 1000");
assert(partnerPayout2 === 9000, "Partner payout for payment 2 is KSh 9000");

// Total platform commission across installments
const totalCommission = comm1 + comm2;
const totalPartnerPayout = partnerPayout1 + partnerPayout2;
assert(totalCommission === 1500, "Total commission earned is KSh 1500");
assert(totalPartnerPayout === 13500, "Total partner payout is KSh 13500");

console.log(`\nFlow Simulation Results: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
