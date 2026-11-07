import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { emailLayout, escapeHtml, sendEmail } from "@/lib/email";

// Password badalne ke baad client isse call karta hai.
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
    subject: "Your Deep IT Solutions Point password was changed",
    html: emailLayout(
      `Password changed, ${name}`,
      `<p>The password for your account was changed on <strong>${when} (IST)</strong>.</p>
       <p>If this was you, no action is needed. If it was not, please reset your password again right away and contact the institute.</p>`
    ),
  });

  return NextResponse.json({ ok: true });
}