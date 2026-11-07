"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.name } },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        // Account ban gaya aur user logged in hai: welcome email + dashboard
        fetch("/api/notify-welcome", { method: "POST" }).catch(() => {});
        router.push("/dashboard");
        router.refresh();
      } else {
        // Sirf tab aata hai jab Supabase mein "Confirm email" on ho
        setError("Check your email to confirm your account, then log in.");
      }
    } catch {
      setError("Could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Left: brand panel (desktop only) */}
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
            Technology that goes deeper than the surface.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/65">
            Software, networks and support for teams that want their IT to just
            work.
          </p>
        </div>

        <p className="text-sm text-white/45">© 2026 Deep IT Solutions Point</p>
      </aside>

      {/* Right: form */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[380px]">
          {/* Mobile brand */}
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
            Create your account
          </h1>
          <p className="mt-2 text-[15px] text-[color:var(--ink-soft)]">
            It takes less than a minute.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 flex flex-col gap-5">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="field"
                required
              />
            </div>

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
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className="field pr-16"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-1 text-sm font-medium text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] focus-visible:outline-2 focus-visible:outline-[color:var(--accent)]"
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-sm text-[color:var(--ink-soft)]">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-[color:var(--accent)] underline-offset-4 hover:underline"
            >
              Log in
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}