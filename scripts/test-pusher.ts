import { pusherServer } from "../src/lib/pusher";

async function testPusher() {
  console.log("\n========================================");
  console.log("       Testing Pusher Real-Time         ");
  console.log("========================================\n");

  try {
    console.log("1. Triggering test event to Pusher channel 'test-channel'...");
    const response = await pusherServer.trigger("test-channel", "test-event", {
      message: "CampusKey Realtime Test",
      timestamp: new Date().toISOString(),
    });

    console.log(`  ✓ Pusher event sent successfully! Status: ${response.status}`);
    console.log("\n🎉 PUSHER TEST PASSED!\n");
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Pusher Test Failed:", error.message || error);
    process.exit(1);
  }
}

testPusher();
