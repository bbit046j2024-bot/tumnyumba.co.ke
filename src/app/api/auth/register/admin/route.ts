import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Secure Admin Registration API Route
export async function POST(req: Request) {
  try {
    const { name, email, phone, password, secretKey } = await req.json();

    // Verify admin registration secret key (must be configured in .env)
    const ADMIN_SECRET = process.env.ADMIN_REGISTRATION_SECRET;
    if (!ADMIN_SECRET || secretKey !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Invalid or unconfigured Admin Registration Secret Key" },
        { status: 403 }
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json({ error: "An account with this email address already exists." }, { status: 400 });
      }
      return NextResponse.json({ error: "An account with this phone number already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Admin account created successfully", adminId: admin.id },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create admin account" }, { status: 500 });
  }
}
