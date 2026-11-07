import Image from "next/image";

// Forgot/Reset password pages ka common frame (left brand panel + right form)
export default function AuthShell({
  heading,
  blurb,
  children,
}: {
  heading: string;
  blurb: string;
  children: React.ReactNode;
}) {
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
            {heading}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/65">{blurb}</p>
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
          {children}
        </div>
      </section>
    </main>
  );
}