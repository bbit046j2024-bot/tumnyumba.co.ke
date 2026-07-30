import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, course, yearOfStudy } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone: phone || undefined }] },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User with this email or phone already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "STUDENT",
        studentProfile: {
          create: {
            course,
            yearOfStudy: parseInt(yearOfStudy) || 1,
          },
        },
      },
    });

    return NextResponse.json({ message: "Student account created successfully", userId: user.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create student account" }, { status: 500 });
  }
}
