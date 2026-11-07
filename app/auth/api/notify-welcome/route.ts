import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { emailLayout, escapeHtml, sendEmail } from "@/lib/email";

// Signup ke turant baad client isse call karta hai.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const name = escapeHtml((user.user_metadata?.full_name as string) || "there");

  await sendEmail({
    to: user.email,
    subject: "Welcome to Deep IT Solutions Point",
    html: emailLayout(
      `Welcome, ${name}`,
      `<p>Your account has been created. You can now log in to see your courses, batches and profile.</p>
       <p>If you did not create this account, please contact the institute.</p>`
    ),
  });

  return NextResponse.json({ ok: true });
}