"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({
  confirmed,
  confirmFailed,
}: {
  confirmed: boolean;
  confirmFailed: boolean;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(
          error.code === "email_not_confirmed"
            ? "Please confirm your email first. Check your inbox."
            : "Incorrect email or password."
        );
        return;
      }

      // Login alert email (fail ho to bhi user ko rokna nahi hai)
      fetch("/api/notify-login", { method: "POST" }).catch(() => {});

      // Role dekho: admin ko /admin, student ko /dashboard
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
      setError("Could not log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="depth-panel relative hidden flex-col justify-between p-14 text-white lg:flex">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt="Deep IT Solutions Point logo"
            width={44}
            height={44}
            className="rounded-full object-cover ring-1 ring-white/25"
          />
          <span className="font-display text-lg font-semibold tracking-tight">
            Deep IT Solutions Point
          </span>
        </div>
        <div className="max-w-md">
          <h2 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight">
            Welcome back.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/65">
            Log in to pick up right where you left off.
          </p>
        </div>
        <p className="text-sm text-white/45">© 2026 Deep IT Solutions Point</p>
      </aside>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[380px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <Image
              src="/logo.jpeg"
              alt="Deep IT Solutions Point logo"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <span className="font-display text-base font-semibold tracking-tight">
              Deep IT Solutions Point
            </span>
          </div>

          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Log in
          </h1>

          {confirmed && (
            <p role="status" className="mt-3 text-[15px] text-[color:var(--accent)]">
              Email confirmed. You can log in now.
            </p>
          )}
          {confirmFailed && (
            <p role="alert" className="mt-3 text-[15px] text-[color:var(--danger)]">
              That confirmation link is invalid or expired.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-9 flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="field"
                required
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-[color:var(--accent)] underline-offset-4 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Your password"
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

            {error && (
              <p role="alert" className="text-sm text-[color:var(--danger)]">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary mt-1" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-8 text-sm text-[color:var(--ink-soft)]">
            New here?{" "}
            <a
              href="/"
              className="font-medium text-[color:var(--accent)] underline-offset-4 hover:underline"
            >
              Create an account
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}