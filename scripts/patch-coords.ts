/**
 * Manual coordinate patch for properties that Nominatim couldn't resolve.
 * Uses known Mombasa neighbourhood coordinates.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Known Mombasa neighbourhood coordinates (verified via Google Maps)
// Tudor / Kiziwi area: around -4.0250, 39.6620
const PATCHES: { area: string; subcounty: string; lat: number; lng: number }[] = [
  { area: "kiziwi",  subcounty: "Tudor", lat: -4.0248, lng: 39.6622 },
  { area: "Kiziwi",  subcounty: "Tudor", lat: -4.0248, lng: 39.6622 },
];

async function main() {
  for (const patch of PATCHES) {
    const result = await prisma.property.updateMany({
      where: {
        area: patch.area,
        subcounty: patch.subcounty,
        latitude: null,
      },
      data: { latitude: patch.lat, longitude: patch.lng },
    });
    if (result.count > 0) {
      console.log(`✅ Patched ${result.count} property in ${patch.area}, ${patch.subcounty} → lat=${patch.lat}, lng=${patch.lng}`);
    }
  }

  // Verify final state
  console.log("\n📍 Final coordinates in DB:");
  const all = await prisma.property.findMany({
    select: { title: true, area: true, subcounty: true, latitude: true, longitude: true },
  });
  for (const p of all) {
    const status = p.latitude ? "✅" : "❌ still null";
    console.log(`  ${status}  ${p.title} → lat=${p.latitude}, lng=${p.longitude}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
