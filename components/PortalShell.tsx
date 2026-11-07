import Image from "next/image";
import { logout } from "@/app/dashboard/actions";
import NavLinks, { type NavItem } from "./NavLinks";

export default function PortalShell({
  title,
  links,
  name,
  email,
  children,
}: {
  title: string;
  links: NavItem[];
  name: string;
  email: string;
  children: React.ReactNode;
}) {
  const initial = (name || email || "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen lg:flex">
      <aside className="bg-[color:var(--ink)] text-white lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-5 py-5">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpeg"
              alt="Deep IT Solutions Point logo"
              width={36}
              height={36}
              className="rounded-full object-cover ring-1 ring-white/25"
            />
            <span className="font-display text-[15px] font-semibold leading-tight tracking-tight">
              Deep IT Solutions Point
            </span>
          </div>
          {/* Mobile logout */}
          <form action={logout} className="lg:hidden">
            <button type="submit" className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white/80">
              Log out
            </button>
          </form>
        </div>

        <p className="px-5 pb-1 text-xs font-medium uppercase tracking-wider text-white/45">
          {title}
        </p>
        <NavLinks links={links} />

        {/* Desktop user block */}
        <div className="mt-auto hidden border-t border-white/10 p-5 lg:block">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold"
            >
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name || "Student"}</p>
              <p className="truncate text-xs text-white/55">{email}</p>
            </div>
          </div>
          <form action={logout} className="mt-4">
            <button
              type="submit"
              className="w-full rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white/85 hover:bg-white/5"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-h-screen flex-1 bg-[color:var(--mist)] lg:ml-64">
        <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}