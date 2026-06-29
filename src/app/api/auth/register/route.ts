import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { apiError, apiSuccess } from "@/lib/utils";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validate Input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return apiError("Invalid input", "VALIDATION_ERROR", 400, result.error.flatten());
    }

    const { name, email, password, phone } = result.data;

    // 2. Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return apiError("Email already in use", "CONFLICT", 409);
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Create User
    const user = await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: "CUSTOMER", // default role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return apiSuccess({ user }, 201);
  } catch (error) {
    console.error("[Register API Error]", error);
    return apiError("Internal server error", "INTERNAL_ERROR", 500);
  }
}
