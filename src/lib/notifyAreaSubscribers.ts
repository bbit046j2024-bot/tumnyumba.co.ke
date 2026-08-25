/**
 * notifyAreaSubscribers
 *
 * Called (fire-and-forget) when a property is verified by an admin.
 * Finds every student subscribed to the property's area, creates an
 * in-app Notification row for each, and sends them an email alert.
 */

import { prisma } from "@/lib/prisma";
import { cacheDelete } from "@/lib/cache";
import { sendAreaListingAlert } from "@/lib/email";

interface VerifiedProperty {
  id: string;
  title: string;
  area: string;
  rent: number;
}

export async function notifyAreaSubscribers(property: VerifiedProperty): Promise<void> {
  // Normalise the area name the same way subscribers store it
  const normalisedArea = property.area.trim().toLowerCase();

  // Find all subscriptions for this area, including the subscriber's user record
  const subscriptions = await prisma.areaSubscription.findMany({
    where: { area: normalisedArea },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (subscriptions.length === 0) return;

  const notificationBody =
    `A new listing just went live in ${property.area}: "${property.title}" — Ksh ${property.rent.toLocaleString()}/month.`;

  // Batch-create in-app notifications for all subscribers
  await prisma.notification.createMany({
    data: subscriptions.map((sub) => ({
      userId: sub.user.id,
      title: `New listing in ${property.area} 🏠`,
      body: notificationBody,
      link: `/listings/${property.id}`,
    })),
  });

  // Invalidate each subscriber's notification cache so they see it immediately
  for (const sub of subscriptions) {
    cacheDelete(`notifications:${sub.user.id}`);
  }

  // Send email alerts — fire individually so one failure doesn't block the rest
  await Promise.allSettled(
    subscriptions.map((sub) =>
      sendAreaListingAlert(
        sub.user.email,
        sub.user.name,
        property.area,
        property.title,
        property.id,
        property.rent
      )
    )
  );
}
