"use server";

import { auth } from "@clerk/nextjs/server";
import { bulkDeleteCombos, bulkPublishCombos, bulkPublishRecipes, bulkDeleteRecipes } from "@/database/db";
import connectDB from "@/database/db";
import User from "@/database/UserSchema";

async function assertStaffEditor() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  await connectDB();
  const user = await User.findOne({ clerkId: userId }).lean<{ role?: string } | null>();
  if (!user || (user.role !== "Admin" && user.role !== "Kitchen Staff")) {
    throw new Error("Forbidden");
  }
}

export async function publishCombos(ids: string[]) {
  await assertStaffEditor();

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("No combos selected");
  }

  await bulkPublishCombos(ids);
}

export async function deleteCombos(ids: string[]) {
  await assertStaffEditor();

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("No combos selected");
  }

  await bulkDeleteCombos(ids);
}

export async function publishRecipes(ids: string[]) {
  await assertStaffEditor();

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("No recipes selected");
  }

  await bulkPublishRecipes(ids);
}

export async function deleteRecipes(ids: string[]) {
  await assertStaffEditor();

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("No recipes selected");
  }

  await bulkDeleteRecipes(ids);
}
