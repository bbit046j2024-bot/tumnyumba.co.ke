import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
      return NextResponse.json({ error: "Partner with this email or phone already exists" }, { status: 400 });
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

    return NextResponse.json({ message: "Partner application submitted successfully", userId: user.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit partner application" }, { status: 500 });
  }
}
