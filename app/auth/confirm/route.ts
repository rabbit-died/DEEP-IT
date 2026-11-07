import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { emailLayout, escapeHtml, sendEmail } from "@/lib/email";

// Email ke links yahin aate hain:
// /auth/confirm?token_hash=...&type=email      (signup confirm)
// /auth/confirm?token_hash=...&type=recovery   (password reset)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      // Password reset: naya password set karne wale page par bhejo
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // Signup verify hua: welcome email bhejo
      if (type === "email" || type === "signup") {
        const user = data.user;
        if (user?.email) {
          const name = escapeHtml(
            (user.user_metadata?.full_name as string) || "there"
          );
          await sendEmail({
            to: user.email,
            subject: "Welcome to Deep IT Solutions Point",
            html: emailLayout(
              `Welcome, ${name}`,
              `<p>Your email has been verified and your account is now active.</p>
               <p>You can log in anytime with this email address and the password you created.</p>`
            ),
          });
        }
      }
      return NextResponse.redirect(`${origin}/login?confirmed=1`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirm_failed`);
}