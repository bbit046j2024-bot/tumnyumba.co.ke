import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Secure Admin Registration API Route
export async function POST(req: Request) {
  try {
    const { name, email, phone, password, secretKey } = await req.json();

    // Verify admin registration secret key (configured in .env or default)
    const ADMIN_SECRET = process.env.ADMIN_REGISTRATION_SECRET || "tum-admin-secret-2026";

    if (secretKey !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Invalid Admin Registration Secret Key" },
        { status: 403 }
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "ADMIN",
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
