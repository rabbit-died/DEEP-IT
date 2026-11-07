"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await requireUser();

  const full_name = String(formData.get("full_name") ?? "").trim().slice(0, 100);
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 20);

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: full_name || null, phone: phone || null })
    .eq("id", user.id);

  if (error) redirect("/dashboard/profile?error=Could not save your profile.");

  revalidatePath("/", "layout");
  redirect("/dashboard/profile?saved=1");
}