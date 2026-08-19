import { execSync } from "child_process";

const tests = [
  { name: "Commission & Encryption", file: "scripts/test-payment-system.ts" },
  { name: "Booking Lifecycle Flow", file: "scripts/test-mock-flow.ts" },
  { name: "TiDB Cloud Database", file: "scripts/test-db.ts" },
  { name: "Upstash Redis & QStash", file: "scripts/test-redis-qstash.ts" },
  { name: "Pusher Realtime", file: "scripts/test-pusher.ts" },
  { name: "Safaricom Daraja API", file: "scripts/test-daraja.ts" },
];

console.log("\n================================================");
console.log("   CampusKey Complete System Diagnostic Suite   ");
console.log("================================================\n");

let passed = 0;
let failed = 0;

for (const t of tests) {
  try {
    console.log(`▶ Running [${t.name}]...`);
    execSync(`npx tsx --env-file=.env ${t.file}`, { stdio: "inherit" });
    passed++;
  } catch (err) {
    console.error(`❌ [${t.name}] failed.`);
    failed++;
  }
}

console.log("\n================================================");
console.log(`Suite Summary: ${passed} passed, ${failed} failed out of ${tests.length} test suites.`);
console.log("================================================\n");

if (failed > 0) process.exit(1);
