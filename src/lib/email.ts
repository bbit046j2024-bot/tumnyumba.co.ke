import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://campuskey.co.ke";

// ─── Shared HTML helpers ────────────────────────────────────────────────────

function baseTemplate(body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CampusKey</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a5c3e 0%,#1F6B4A 100%);padding:32px 40px;text-align:center;">
            <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Campus<span style="color:#fde047;">Key</span></span>
            <p style="margin:4px 0 0;color:#a7f3d0;font-size:13px;">Mombasa · Find. Live. Belong.</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:40px 40px 32px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8faf9;padding:20px 40px;text-align:center;border-top:1px solid #e8f0ec;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} CampusKey Mombasa. All rights reserved.</p>
            <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">
              <a href="${APP_URL}" style="color:#1F6B4A;text-decoration:none;">${APP_URL}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string) {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr><td style="background:#1F6B4A;border-radius:10px;">
      <a href="${href}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;border-radius:10px;">${label}</a>
    </td></tr>
  </table>`;
}

function heading(text: string) {
  return `<h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#111827;">${text}</h1>`;
}

function para(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#374151;">${text}</p>`;
}

function smallNote(text: string) {
  return `<p style="margin:16px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">${text}</p>`;
}

// ─── 1. Email Verification ──────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;
  const html = baseTemplate(`
    ${heading("Verify your email address")}
    ${para(`Hi <strong>${name}</strong>, welcome to CampusKey! We're thrilled to have you.`)}
    ${para("Please click the button below to verify your email address and activate your account. The link expires in <strong>24 hours</strong>.")}
    ${btn(verifyUrl, "Verify My Email")}
    ${para("Or copy and paste this link into your browser:")}
    <p style="margin:0 0 16px;font-size:13px;word-break:break-all;color:#1F6B4A;">${verifyUrl}</p>
    ${smallNote("If you didn't create a CampusKey account, you can safely ignore this email.")}
  `);

  const res = await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your CampusKey email address",
    html,
  });

  if (res.error) {
    throw new Error(`Resend error (${res.error.name}): ${res.error.message}`);
  }

  return res.data;
}

// ─── 2. Welcome Email ───────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string, role: "STUDENT" | "PARTNER") {
  const isPartner = role === "PARTNER";
  const html = baseTemplate(`
    ${heading(`Welcome to CampusKey, ${name}! 🎉`)}
    ${para(`Your email has been verified and your ${isPartner ? "partner" : "student"} account is now active.`)}
    ${isPartner
      ? para("Your partner application is under review. Our team will approve it shortly — you'll be notified by email. Once approved you can list your properties.")
      : para("You can now browse verified student housing in Mombasa, save your favourite listings, and contact property partners directly.")}
    ${btn(isPartner ? `${APP_URL}/partner/dashboard` : `${APP_URL}/listings`, isPartner ? "Go to Partner Dashboard" : "Browse Listings")}
    ${smallNote("Need help? Reply to this email or visit our support page.")}
  `);

  const res = await resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to CampusKey${isPartner ? " — Application Received" : ""}!`,
    html,
  });

  if (res.error) {
    throw new Error(`Resend error (${res.error.name}): ${res.error.message}`);
  }

  return res.data;
}

// ─── 3. Password Reset ──────────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;
  const html = baseTemplate(`
    ${heading("Reset your password")}
    ${para(`Hi <strong>${name}</strong>, we received a request to reset your CampusKey password.`)}
    ${para("Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.")}
    ${btn(resetUrl, "Reset My Password")}
    ${para("Or copy and paste this link into your browser:")}
    <p style="margin:0 0 16px;font-size:13px;word-break:break-all;color:#1F6B4A;">${resetUrl}</p>
    ${smallNote("If you didn't request a password reset, please ignore this email — your account is safe.")}
  `);

  const res = await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your CampusKey password",
    html,
  });

  if (res.error) {
    throw new Error(`Resend error (${res.error.name}): ${res.error.message}`);
  }

  return res.data;
}

// ─── 4. Booking / Interest Notification (Partner) ──────────────────────────

export async function sendBookingNotificationToPartner(
  partnerEmail: string,
  partnerName: string,
  studentName: string,
  propertyTitle: string,
  propertyId: string
) {
  const html = baseTemplate(`
    ${heading("New interest in your property 🏠")}
    ${para(`Hi <strong>${partnerName}</strong>, great news!`)}
    ${para(`<strong>${studentName}</strong> has just expressed interest in your listing:`)}
    <div style="background:#f0fdf4;border-left:4px solid #1F6B4A;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0;font-size:16px;font-weight:700;color:#111827;">${propertyTitle}</p>
    </div>
    ${para("Log in to your dashboard to view their contact details and follow up.")}
    ${btn(`${APP_URL}/partner/bookings`, "View Bookings")}
    ${smallNote("You're receiving this because you have a listed property on CampusKey.")}
  `);

  const res = await resend.emails.send({
    from: FROM,
    to: partnerEmail,
    subject: `New interest: ${propertyTitle}`,
    html,
  });

  if (res.error) {
    throw new Error(`Resend error (${res.error.name}): ${res.error.message}`);
  }

  return res.data;
}

// ─── 5. Booking / Interest Confirmation (Student) ──────────────────────────

export async function sendBookingConfirmationToStudent(
  studentEmail: string,
  studentName: string,
  propertyTitle: string,
  propertyId: string
) {
  const html = baseTemplate(`
    ${heading("Interest confirmed! ✅")}
    ${para(`Hi <strong>${studentName}</strong>, you've successfully expressed interest in:`)}
    <div style="background:#f0fdf4;border-left:4px solid #1F6B4A;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0;font-size:16px;font-weight:700;color:#111827;">${propertyTitle}</p>
    </div>
    ${para("The property partner has been notified and will reach out to you soon. You can also view the listing and their contact details on your dashboard.")}
    ${btn(`${APP_URL}/listings/${propertyId}`, "View Listing")}
    ${smallNote("Tip: Make sure your phone number on your profile is up to date so the partner can reach you easily.")}
  `);

  const res = await resend.emails.send({
    from: FROM,
    to: studentEmail,
    subject: `Interest confirmed — ${propertyTitle}`,
    html,
  });

  if (res.error) {
    throw new Error(`Resend error (${res.error.name}): ${res.error.message}`);
  }

  return res.data;
}

// ─── 6. Area Listing Alert (Student) ───────────────────────────────────────

export async function sendAreaListingAlert(
  to: string,
  studentName: string,
  area: string,
  propertyTitle: string,
  propertyId: string,
  rent: number
) {
  const listingUrl = `${APP_URL}/listings/${propertyId}`;
  const html = baseTemplate(`
    ${heading(`New listing in ${area}! 🏠`)}
    ${para(`Hi <strong>${studentName}</strong>, a new verified property just went live in an area you're watching:`)}
    <div style="background:#f0fdf4;border-left:4px solid #1F6B4A;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0;font-size:16px;font-weight:700;color:#111827;">${propertyTitle}</p>
      <p style="margin:6px 0 0;font-size:14px;color:#6b7280;"><strong>${area}</strong> &nbsp;·&nbsp; Ksh ${rent.toLocaleString()}/month</p>
    </div>
    ${para("Be the first to express interest — spots go fast!")}
    ${btn(listingUrl, "View Listing")}
    ${smallNote(`You're receiving this because you subscribed to listing alerts for <strong>${area}</strong>. <a href="${APP_URL}/profile" style="color:#1F6B4A;">Manage your subscriptions</a>.`)}
  `);

  const res = await resend.emails.send({
    from: FROM,
    to,
    subject: `New listing in ${area} — ${propertyTitle}`,
    html,
  });

  if (res.error) {
    throw new Error(`Resend error (${res.error.name}): ${res.error.message}`);
  }

  return res.data;
}

// ─── 7. Tenancy Confirmation Request (Student) ──────────────────────────────

export async function sendTenancyConfirmationEmailToStudent(
  to: string,
  studentName: string,
  landlordName: string,
  propertyTitle: string,
  unitNumber: string | null,
  periodLabel: string,
  endDateFormatted: string,
  monthlyRent: number,
  tenancyId: string
) {
  const confirmUrl = `${APP_URL}/notifications?tenancyId=${tenancyId}`;
  const html = baseTemplate(`
    ${heading("Confirm your Tenancy / Stay 🏠")}
    ${para(`Hi <strong>${studentName}</strong>,`)}
    ${para(`Landlord <strong>${landlordName}</strong> has recorded you as an active resident at:`)}
    <div style="background:#f0fdf4;border-left:4px solid #1F6B4A;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0;font-size:16px;font-weight:700;color:#111827;">${propertyTitle}${unitNumber ? ` (${unitNumber})` : ""}</p>
      <p style="margin:6px 0 0;font-size:14px;color:#374151;"><strong>Period:</strong> ${periodLabel} (Until ${endDateFormatted})</p>
      <p style="margin:4px 0 0;font-size:14px;color:#374151;"><strong>Agreed Rent:</strong> Ksh ${monthlyRent.toLocaleString()}/month</p>
    </div>
    ${para("Please confirm this tenancy to lock in your resident status and help keep listing availability accurate on CampusKey.")}
    ${btn(confirmUrl, "Review & Confirm Tenancy")}
    ${smallNote("If you did not book or move into this property, you can reject this request on your dashboard.")}
  `);

  const res = await resend.emails.send({
    from: FROM,
    to,
    subject: `Confirm your tenancy at ${propertyTitle}`,
    html,
  });

  if (res.error) {
    throw new Error(`Resend error (${res.error.name}): ${res.error.message}`);
  }

  return res.data;
}

// ─── 8. Tenancy Expiry & Relist Reminder (Landlord) ─────────────────────────

export async function sendTenancyExpiryReminderToLandlord(
  to: string,
  landlordName: string,
  propertyTitle: string,
  unitNumber: string | null,
  tenantName: string,
  endDateFormatted: string,
  tenancyId: string,
  propertyId: string,
  isExpired: boolean
) {
  const relistUrl = `${APP_URL}/partner/tenancies?relist=${tenancyId}`;
  const renewUrl = `${APP_URL}/partner/tenancies?renew=${tenancyId}`;

  const html = baseTemplate(`
    ${heading(isExpired ? "Semester/Lease Ended — Relist Property? 🔔" : "Upcoming Tenancy Expiry Reminder 🗓️")}
    ${para(`Hi <strong>${landlordName}</strong>,`)}
    ${para(
      isExpired
        ? `The tenancy for <strong>${tenantName}</strong> at <strong>${propertyTitle}${unitNumber ? ` (${unitNumber})` : ""}</strong> reached its end date on <strong>${endDateFormatted}</strong>.`
        : `The tenancy for <strong>${tenantName}</strong> at <strong>${propertyTitle}${unitNumber ? ` (${unitNumber})` : ""}</strong> is scheduled to end on <strong>${endDateFormatted}</strong>.`
    )}
    <div style="background:#f0fdf4;border-left:4px solid #1F6B4A;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0;font-size:15px;font-weight:700;color:#111827;">Has the student/tenant vacated, or are they staying for next semester?</p>
    </div>
    ${para("Take quick action to keep your property availability up to date:")}
    <table cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr>
        <td style="background:#1F6B4A;border-radius:10px;padding-right:12px;">
          <a href="${relistUrl}" style="display:inline-block;padding:12px 24px;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">🟢 Student Left: Re-list as Available</a>
        </td>
      </tr>
    </table>
    <p style="margin:12px 0 0;font-size:14px;">
      Staying for next semester? <a href="${renewUrl}" style="color:#1F6B4A;font-weight:600;text-decoration:underline;">Click here to Renew Tenancy</a>
    </p>
    ${smallNote("Re-listing will instantly broadcast your vacancy to students who subscribed to alerts in your area.")}
  `);

  const res = await resend.emails.send({
    from: FROM,
    to,
    subject: isExpired
      ? `Action needed: Relist ${propertyTitle} (Tenancy Ended)`
      : `Reminder: Tenancy ending soon for ${propertyTitle}`,
    html,
  });

  if (res.error) {
    throw new Error(`Resend error (${res.error.name}): ${res.error.message}`);
  }

  return res.data;
}

// ─── 9. Tenancy Audit Digest (Admin) ────────────────────────────────────────

export async function sendTenancyExpiryDigestToAdmin(
  to: string,
  expiringCount: number,
  unlistedCount: number
) {
  const adminUrl = `${APP_URL}/admin/tenancies`;
  const html = baseTemplate(`
    ${heading("Tenancy & Relisting Audit Digest 📊")}
    ${para("Hello Admin, here is the campus accommodation tenancy audit summary for this cycle:")}
    <div style="background:#f0fdf4;border-left:4px solid #1F6B4A;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0 0 8px;font-size:15px;color:#111827;"><strong>${expiringCount}</strong> tenancies expiring this week.</p>
      <p style="margin:0;font-size:15px;color:#b91c1c;"><strong>${unlistedCount}</strong> properties have ended tenancies and remain unlisted.</p>
    </div>
    ${para("Log in to the Admin Tenancies center to view landlord details and assist in relisting:")}
    ${btn(adminUrl, "Open Admin Tenancies Dashboard")}
  `);

  const res = await resend.emails.send({
    from: FROM,
    to,
    subject: `CampusKey Audit: ${unlistedCount} unlisted properties / ${expiringCount} expiring tenancies`,
    html,
  });

  if (res.error) {
    throw new Error(`Resend error (${res.error.name}): ${res.error.message}`);
  }

  return res.data;
}

