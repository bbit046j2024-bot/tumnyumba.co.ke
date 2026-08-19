import { prisma } from "../src/lib/prisma";

async function checkRecentUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      verificationTokens: {
        select: {
          token: true,
          expiresAt: true,
        }
      }
    }
  });

  console.log("Recent Users in Database:", JSON.stringify(users, null, 2));
}

checkRecentUsers();
