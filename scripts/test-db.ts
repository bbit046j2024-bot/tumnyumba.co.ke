import { prisma } from "../src/lib/prisma";

async function testDatabase() {
  console.log("\n========================================");
  console.log("    Testing TiDB Cloud MySQL Database   ");
  console.log("========================================\n");

  try {
    console.log("1. Connecting to TiDB Cloud database...");
    await prisma.$connect();
    console.log("  ✓ Successfully connected to TiDB database!");

    console.log("\n2. Querying user table count...");
    const userCount = await prisma.user.count();
    console.log(`  ✓ Database query successful! Total users in DB: ${userCount}`);

    console.log("\n3. Querying property listings count...");
    const propertyCount = await prisma.property.count();
    console.log(`  ✓ Total properties in DB: ${propertyCount}`);

    console.log("\n🎉 DATABASE CONNECTION TEST PASSED!\n");
  } catch (error: any) {
    console.error("\n❌ Database Connection Failed:", error.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
