"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ok" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email ke link se aane par user ka recovery session ban chuka hota hai
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setStatus(data.user ? "ok" : "invalid");
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }

      fetch("/api/notify-password-changed", { method: "POST" }).catch(() => {});

      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      router.push(
        (prof as { role?: string } | null)?.role === "admin"
          ? "/admin"
          : "/dashboard"
      );
      router.refresh();
    } catch {
      setError("Could not update your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      heading="A fresh start."
      blurb="Choose a new password and you will be logged straight in."
    >
      {status === "checking" && (
        <p className="text-[15px] text-[color:var(--ink-soft)]">Checking your link...</p>
      )}

      {status === "invalid" && (
        <div role="alert">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Link expired
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-soft)]">
            This reset link is invalid or has expired. Request a new one to
            continue.
          </p>
          <a
            href="/forgot-password"
            className="btn-primary mt-8 flex items-center justify-center no-underline"
          >
            Request a new link
          </a>
        </div>
      )}

      {status === "ok" && (
        <>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Set a new password
          </h1>
          <p className="mt-2 text-[15px] text-[color:var(--ink-soft)]">
            Use at least 8 characters.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 flex flex-col gap-5">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className="field pr-16"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-1 text-sm font-medium text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium">
                Confirm new password
              </label>
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (error) setError("");
                }}
                className="field"
                required
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-[color:var(--danger)]">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Update password"}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}