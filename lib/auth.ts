import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Logged-in user chahiye, warna /login
export async function requireUser() {
  // Pehle request ka intezaar karo. Supabase andar Date.now() use karta hai,
  // jo prerender ke time allowed nahi hai.
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const fallback: Profile = {
    id: user.id,
    full_name: (user.user_metadata?.full_name as string) ?? null,
    email: user.email ?? null,
    phone: null,
    role: "student",
    created_at: user.created_at,
  };

  const profile = (data as Profile | null) ?? fallback;
  return { supabase, user, profile };
}

// Sirf admin, warna student dashboard par wapas
export async function requireAdmin() {
  const ctx = await requireUser();
  if (ctx.profile.role !== "admin") redirect("/dashboard");
  return ctx;
}