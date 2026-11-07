import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { emailLayout, escapeHtml, sendEmail } from "@/lib/email";

// Login ke baad client isse call karta hai. Sirf logged-in user ko email jati hai.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const name = escapeHtml((user.user_metadata?.full_name as string) || "there");
  const when = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  await sendEmail({
    to: user.email,
    subject: "New login to your Deep IT Solutions Point account",
    html: emailLayout(
      `You just logged in, ${name}`,
      `<p>We noticed a login to your account on <strong>${when} (IST)</strong>.</p>
       <p>If this was you, no action is needed. If it wasn't, please reset your password immediately.</p>`
    ),
  });

  return NextResponse.json({ ok: true });
}