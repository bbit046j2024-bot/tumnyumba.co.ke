import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const companyName = formData.get("companyName") as string;
    const licenseNumber = formData.get("licenseNumber") as string;

    if (!name || !email || !password || !companyName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone: phone || undefined }] },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json({ error: "An account with this email address already exists." }, { status: 400 });
      }
      return NextResponse.json({ error: "An account with this phone number already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "PARTNER",
        partnerProfile: {
          create: {
            companyName,
            licenseNumber,
            status: "PENDING",
          },
        },
      },
    });

    // Generate email verification token (24h expiry)
    const token = randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, name, token).catch(console.error);

    return NextResponse.json(
      { message: "Partner application submitted successfully. Please check your email to verify your account.", userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit partner application" }, { status: 500 });
  }
}
