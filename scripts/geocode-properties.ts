/**
 * Backfills latitude/longitude into the database for any property
 * that has no coordinates stored yet, by geocoding via OSM Nominatim.
 *
 * Run with: npx tsx --env-file=.env scripts/geocode-properties.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function geocode(area: string, subcounty: string, county: string): Promise<{ lat: number; lng: number } | null> {
  const query = `${area}, ${subcounty}, ${county}, Kenya`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=ke`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "CampusKey/1.0 (campuskey.co.ke)" },
    });
    const data = await res.json() as { lat: string; lon: string; display_name: string }[];
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (e) {
    console.error("  Nominatim error:", e);
  }
  return null;
}

async function main() {
  const properties = await prisma.property.findMany({
    where: { latitude: null },
    select: { id: true, title: true, area: true, subcounty: true, county: true },
  });

  if (properties.length === 0) {
    console.log("✅ All properties already have coordinates stored.");
    return;
  }

  console.log(`🗺️  Found ${properties.length} properties with no coordinates. Geocoding...\n`);

  for (const prop of properties) {
    console.log(`  → ${prop.title} (${prop.area}, ${prop.subcounty}, ${prop.county})`);

    const coords = await geocode(prop.area, prop.subcounty, prop.county);

    if (coords) {
      await prisma.property.update({
        where: { id: prop.id },
        data: { latitude: coords.lat, longitude: coords.lng },
      });
      console.log(`     ✅ Saved: lat=${coords.lat}, lng=${coords.lng}`);
    } else {
      console.log(`     ⚠️  Could not geocode — leaving null.`);
    }

    // Nominatim rate limit: max 1 request/second
    await new Promise((r) => setTimeout(r, 1100));
  }

  console.log("\n🎉 Done! Coordinates backfilled into the database.\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
