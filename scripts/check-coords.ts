import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const rows = await p.property.findMany({
    select: { id: true, title: true, area: true, subcounty: true, county: true, latitude: true, longitude: true, mapUrl: true }
  });
  rows.forEach(x => {
    console.log(`\n${x.title}`);
    console.log(`  Area     : ${x.area}, ${x.subcounty}, ${x.county}`);
    console.log(`  latitude : ${x.latitude}`);
    console.log(`  longitude: ${x.longitude}`);
    console.log(`  mapUrl   : ${x.mapUrl || "(none)"}`);
  });
}
main().finally(() => p.$disconnect());
