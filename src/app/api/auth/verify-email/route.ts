import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/email";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/login?error=invalid_token", req.url)
    );
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) {
    return NextResponse.redirect(
      new URL("/auth/login?error=invalid_token", req.url)
    );
  }

  if (record.expiresAt < new Date()) {
    // Delete expired token and allow resend
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.redirect(
      new URL("/auth/login?error=token_expired", req.url)
    );
  }

  // Mark user as verified and delete the token
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  // Send welcome email (fire and forget)
  sendWelcomeEmail(record.user.email, record.user.name, record.user.role as "STUDENT" | "PARTNER").catch(console.error);

  return NextResponse.redirect(
    new URL("/auth/login?verified=1", req.url)
  );
}

// Resend verification email
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 even if not found (avoid user enumeration)
      return NextResponse.json({ message: "If that account exists, a verification email has been sent." });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    }

    // Delete old tokens for this user
    await prisma.verificationToken.deleteMany({ where: { userId: user.id } });

    const token = randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail(user.email, user.name, token);

    return NextResponse.json({ message: "Verification email sent" });
  } catch (err: any) {
    console.error("[POST /api/auth/verify-email]", err);
    return NextResponse.json({ error: "Failed to resend verification email" }, { status: 500 });
  }
}
