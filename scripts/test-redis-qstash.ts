import { redisGet, redisSet } from "../src/lib/redis";
import { getQstash, getQstashReceiver } from "../src/lib/qstash";

async function testRedisAndQStash() {
  console.log("\n========================================");
  console.log("    Testing Upstash Redis & QStash      ");
  console.log("========================================\n");

  try {
    console.log("1. Testing Upstash Redis Write & Read...");
    const testKey = "test:connectivity:" + Date.now();
    const testValue = "pong";

    await redisSet(testKey, testValue, 60);
    console.log("  ✓ Successfully wrote test key to Upstash Redis!");

    const retrieved = await redisGet(testKey);
    if (retrieved === "pong") {
      console.log("  ✓ Successfully read and verified key from Upstash Redis!");
    } else {
      throw new Error(`Unexpected value retrieved from Redis: ${retrieved}`);
    }

    console.log("\n2. Testing Upstash QStash Client & Receiver Initialization...");
    const qstash = getQstash();
    console.log("  ✓ QStash Publisher client initialized!");

    const receiver = getQstashReceiver();
    console.log("  ✓ QStash Webhook Receiver initialized!");

    console.log("\n🎉 ALL REDIS & QSTASH TESTS PASSED!\n");
  } catch (error: any) {
    console.error("\n❌ Redis/QStash Test Failed:", error.message || error);
    process.exitCode = 1;
  }
}

testRedisAndQStash();
