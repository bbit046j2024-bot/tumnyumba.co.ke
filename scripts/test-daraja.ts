import { getPlatformToken, stkPush, getPlatformCredentials } from "../src/lib/daraja";

async function runDarajaTest() {
  console.log("\n========================================");
  console.log("    Testing Safaricom Daraja Sandbox    ");
  console.log("========================================\n");

  try {
    console.log("1. Requesting OAuth Access Token from Safaricom...");
    const token = await getPlatformToken();
    console.log("  ✓ Token successfully received from Daraja!");
    console.log(`    Token preview: ${token.substring(0, 15)}... (Length: ${token.length})`);

    console.log("\n2. Testing STK Push (Lipa na M-Pesa Online Simulation)...");
    const creds = getPlatformCredentials();
    console.log(`    Paybill Shortcode: ${creds.shortCode}`);
    console.log(`    Phone Number: 254708374149`);
    console.log(`    Amount: KSh 1`);

    const result = await stkPush(
      {
        amount: 1,
        customerPhone: "254708374149",
        accountReference: "TEST-BK-001",
        transactionDesc: "Test Payment",
        paymentId: "test-payment-" + Date.now(),
        credentials: creds,
      },
      token
    );

    console.log("\n  ✓ STK Push successfully initiated with Safaricom!");
    console.log(`    ResponseCode: ${result.responseCode}`);
    console.log(`    ResponseDescription: ${result.responseDescription}`);
    console.log(`    MerchantRequestID: ${result.merchantRequestId}`);
    console.log(`    CheckoutRequestID: ${result.checkoutRequestId}`);

    console.log("\n🎉 ALL DARAJA SANDBOX TESTS PASSED SUCCESSFULLY!\n");
  } catch (error: any) {
    console.error("\n❌ Daraja Test Failed:", error.message || error);
    process.exitCode = 1;
  }
}

runDarajaTest();
