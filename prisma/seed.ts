import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.warn("⚠️ Refusing to seed database in production environment.");
    return;
  }
  console.log("🌱 Seeding CampusKey Mombasa database...");

  const adminPassword = await bcrypt.hash("Admin@123456", 10);
  const partnerPassword = await bcrypt.hash("Partner@123456", 10);
  const studentPassword = await bcrypt.hash("Student@123456", 10);

  // 1. Seed Super Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@tumnyumba.co.ke" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@tumnyumba.co.ke",
      phone: "0700000001",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Super Admin created:", admin.email);

  // 2. Seed Partner User & Profile
  const partnerUser = await prisma.user.upsert({
    where: { email: "partner@urbanpoint.co.ke" },
    update: {},
    create: {
      name: "Kelly Victor",
      email: "partner@urbanpoint.co.ke",
      phone: "0722987654",
      password: partnerPassword,
      role: "PARTNER",
      partnerProfile: {
        create: {
          companyName: "UrbanPoint Properties",
          licenseNumber: "UPP-2026-889",
          status: "APPROVED",
        },
      },
    },
  });
  console.log("✅ Partner User created:", partnerUser.email);

  // 3. Seed Student User & Profile
  const studentUser = await prisma.user.upsert({
    where: { email: "student@tum.ac.ke" },
    update: {},
    create: {
      name: "John Ochieng",
      email: "student@tum.ac.ke",
      phone: "0712345678",
      password: studentPassword,
      role: "STUDENT",
      studentProfile: {
        create: {
          course: "BSc. Computer Science",
          yearOfStudy: 2,
          fundingType: "HELB",
        },
      },
    },
  });
  console.log("✅ Student User created:", studentUser.email);

  console.log("\n🎉 Database Seeding Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
