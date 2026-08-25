import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendTenancyExpiryReminderToLandlord,
  sendTenancyExpiryDigestToAdmin,
} from "@/lib/email";
import { getPlatformSettings } from "@/lib/settings";

export async function GET(req: NextRequest) {
  return handleReminders(req);
}

export async function POST(req: NextRequest) {
  return handleReminders(req);
}

async function handleReminders(req: NextRequest) {
  try {
    const now = new Date();
    const fourteenDaysAhead = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // 1. Find upcoming expiries (within next 14 days) that haven't been reminded recently
    const upcomingExpiringTenancies = await prisma.tenancy.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lte: fourteenDaysAhead, gte: now },
        OR: [
          { lastReminderSentAt: null },
          { lastReminderSentAt: { lte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } },
        ],
      },
      include: {
        property: { select: { id: true, title: true } },
        partner: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      take: 50,
    });

    // 2. Find already expired tenancies that are still ACTIVE (overdue for relist)
    const overdueExpiringTenancies = await prisma.tenancy.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lt: now },
        OR: [
          { lastReminderSentAt: null },
          { lastReminderSentAt: { lte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) } },
        ],
      },
      include: {
        property: { select: { id: true, title: true } },
        partner: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      take: 50,
    });

    let landlordRemindersSent = 0;

    // Send reminders for upcoming expiries
    for (const tenancy of upcomingExpiringTenancies) {
      try {
        const formattedEnd = tenancy.endDate.toLocaleDateString("en-KE", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        await sendTenancyExpiryReminderToLandlord(
          tenancy.partner.user.email,
          tenancy.partner.companyName || tenancy.partner.user.name,
          tenancy.property.title,
          tenancy.unitNumber,
          tenancy.tenantName,
          formattedEnd,
          tenancy.id,
          tenancy.property.id,
          false
        );

        await prisma.tenancy.update({
          where: { id: tenancy.id },
          data: { lastReminderSentAt: now },
        });

        landlordRemindersSent++;
      } catch (err) {
        console.warn(`[Worker: Failed to send reminder for tenancy ${tenancy.id}]`, err);
      }
    }

    // Send reminders for overdue expiries (Urgent Relist Prompt)
    for (const tenancy of overdueExpiringTenancies) {
      try {
        const formattedEnd = tenancy.endDate.toLocaleDateString("en-KE", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        await sendTenancyExpiryReminderToLandlord(
          tenancy.partner.user.email,
          tenancy.partner.companyName || tenancy.partner.user.name,
          tenancy.property.title,
          tenancy.unitNumber,
          tenancy.tenantName,
          formattedEnd,
          tenancy.id,
          tenancy.property.id,
          true
        );

        await prisma.tenancy.update({
          where: { id: tenancy.id },
          data: { lastReminderSentAt: now },
        });

        landlordRemindersSent++;
      } catch (err) {
        console.warn(`[Worker: Failed to send overdue reminder for tenancy ${tenancy.id}]`, err);
      }
    }

    // 3. Send digest to Admin if there are overdue or upcoming records
    const settings = await getPlatformSettings();
    if (settings.supportEmail && (upcomingExpiringTenancies.length > 0 || overdueExpiringTenancies.length > 0)) {
      try {
        await sendTenancyExpiryDigestToAdmin(
          settings.supportEmail,
          upcomingExpiringTenancies.length,
          overdueExpiringTenancies.length
        );
      } catch (adminErr) {
        console.warn("[Worker: Failed to send admin digest]", adminErr);
      }
    }

    return NextResponse.json({
      success: true,
      upcomingChecked: upcomingExpiringTenancies.length,
      overdueChecked: overdueExpiringTenancies.length,
      landlordRemindersSent,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error("[Worker: tenancy-reminders error]", error);
    return NextResponse.json({ error: error.message || "Failed to run tenancy reminders" }, { status: 500 });
  }
}
