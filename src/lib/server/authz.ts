import "server-only";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/database/db";
import User from "@/database/UserSchema";
import type { UserRole } from "@/lib/types";

type AuthzSuccess = {
  ok: true;
  userId: string;
  role: UserRole;
};

type AuthzFailure = {
  ok: false;
  response: NextResponse;
};

export type AuthzResult = AuthzSuccess | AuthzFailure;

async function getCurrentDbUser(): Promise<AuthzResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  await connectDB();
  const user = await User.findOne({ clerkId: userId }).lean<{ role?: UserRole } | null>();

  if (!user?.role) {
    return {
      ok: false,
      response: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  return {
    ok: true,
    userId,
    role: user.role,
  };
}

export async function requireSignedIn(): Promise<AuthzResult> {
  return getCurrentDbUser();
}

export async function requireStaffEditor(): Promise<AuthzResult> {
  const result = await getCurrentDbUser();
  if (!result.ok) return result;

  if (result.role !== "Admin" && result.role !== "Kitchen Staff") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return result;
}

export async function requireAdmin(): Promise<AuthzResult> {
  const result = await getCurrentDbUser();
  if (!result.ok) return result;

  if (result.role !== "Admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return result;
}
