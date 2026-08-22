import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const CONTACT_EMAIL = "campusdive.org@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Send to the team inbox
    const res = await resend.emails.send({
      from: FROM,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `[CampusKey Contact] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#f4f7f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:40px 16px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#1a5c3e 0%,#1F6B4A 100%);padding:28px 40px;text-align:center;">
                    <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Campus<span style="color:#fde047;">Key</span></span>
                    <p style="margin:4px 0 0;color:#a7f3d0;font-size:12px;">New Contact Form Submission</p>
                  </td>
                </tr>
                <tr><td style="padding:32px 40px;">
                  <h2 style="margin:0 0 20px;font-size:20px;font-weight:800;color:#111827;">📬 New Message from ${name}</h2>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                    <tr>
                      <td style="padding:8px 12px;background:#f0fdf4;border-radius:8px 8px 0 0;border:1px solid #d1fae5;">
                        <span style="font-size:11px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:0.5px;">From</span>
                        <p style="margin:2px 0 0;font-size:14px;color:#111827;font-weight:600;">${name} &lt;${email}&gt;</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 12px;background:#fff;border:1px solid #d1fae5;border-top:none;border-radius:0 0 8px 8px;">
                        <span style="font-size:11px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:0.5px;">Subject</span>
                        <p style="margin:2px 0 0;font-size:14px;color:#111827;">${subject}</p>
                      </td>
                    </tr>
                  </table>

                  <div style="background:#f8faf9;border-radius:10px;padding:20px 24px;border:1px solid #e5e7eb;margin-bottom:24px;">
                    <span style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Message</span>
                    <p style="margin:8px 0 0;font-size:14px;line-height:1.7;color:#374151;white-space:pre-wrap;">${message}</p>
                  </div>

                  <p style="margin:0;font-size:13px;color:#9ca3af;">
                    Reply directly to this email to respond to ${name} at <a href="mailto:${email}" style="color:#1F6B4A;">${email}</a>
                  </p>
                </td></tr>
                <tr>
                  <td style="background:#f8faf9;padding:16px 40px;text-align:center;border-top:1px solid #e8f0ec;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} CampusKey Mombasa — campusdive.org@gmail.com</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });

    if (res.error) {
      console.error("[POST /api/contact] Resend error:", res.error);
      return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
    }

    // Send auto-reply to the sender
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "We received your message — CampusKey Mombasa",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <body style="margin:0;padding:0;background:#f4f7f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:40px 16px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#1a5c3e 0%,#1F6B4A 100%);padding:28px 40px;text-align:center;">
                    <span style="font-size:22px;font-weight:800;color:#ffffff;">Campus<span style="color:#fde047;">Key</span></span>
                    <p style="margin:4px 0 0;color:#a7f3d0;font-size:12px;">Mombasa · Find. Live. Belong.</p>
                  </td>
                </tr>
                <tr><td style="padding:36px 40px;">
                  <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#111827;">Thanks, ${name}! 👋</h1>
                  <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#374151;">
                    We've received your message and our team will get back to you shortly — usually within <strong>24 hours</strong> on weekdays.
                  </p>
                  <div style="background:#f0fdf4;border-left:4px solid #1F6B4A;border-radius:8px;padding:14px 18px;margin:0 0 20px;">
                    <p style="margin:0;font-size:13px;font-weight:700;color:#065f46;">Your subject: ${subject}</p>
                  </div>
                  <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#374151;">
                    In the meantime, you can also reach us directly:
                  </p>
                  <p style="margin:0 0 6px;font-size:14px;color:#374151;">📞 <a href="tel:+254797844540" style="color:#1F6B4A;font-weight:600;">+254 797 844 540</a></p>
                  <p style="margin:0 0 24px;font-size:14px;color:#374151;">📧 <a href="mailto:campusdive.org@gmail.com" style="color:#1F6B4A;font-weight:600;">campusdive.org@gmail.com</a></p>
                  <p style="margin:0;font-size:13px;color:#9ca3af;">The CampusKey Mombasa Team</p>
                </td></tr>
                <tr>
                  <td style="background:#f8faf9;padding:16px 40px;text-align:center;border-top:1px solid #e8f0ec;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} CampusKey Mombasa. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    }).catch(() => {
      // Auto-reply failure is non-critical — don't fail the request
      console.warn("[POST /api/contact] Auto-reply failed (non-critical)");
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/contact]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
