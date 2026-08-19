import { Resend } from "resend";

async function testEmail() {
  console.log("\n========================================");
  console.log("       Testing Resend Email API         ");
  console.log("========================================\n");

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.log("ℹ️  To send a test email, provide your email as an argument:");
    console.log("   npx tsx --env-file=.env scripts/test-email.ts your-email@example.com\n");
    console.log(`Current API Key: ${apiKey ? apiKey.substring(0, 10) + "..." : "Missing"}`);
    console.log(`Current From: ${from}`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    console.log(`Sending test email to ${targetEmail} from ${from}...`);
    
    const result = await resend.emails.send({
      from,
      to: targetEmail,
      subject: "CampusKey Test Email",
      html: "<strong>CampusKey email integration is working!</strong>",
    });

    console.log("  ✓ Email sent successfully!", result);
    console.log("\n🎉 EMAIL TEST PASSED!\n");
  } catch (error: any) {
    console.error("\n❌ Email Test Failed:", error.message || error);
    process.exit(1);
  }
}

testEmail();
