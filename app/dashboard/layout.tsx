import PortalShell from "@/components/PortalShell";
import { requireUser } from "@/lib/auth";
export const instant = false;
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireUser();

  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/courses", label: "My courses" },
    { href: "/dashboard/batches", label: "Batches" },
    { href: "/dashboard/profile", label: "Profile" },
  ];
  if (profile.role === "admin") {
    links.push({ href: "/admin", label: "Admin panel" });
  }

  return (
    <PortalShell
      title="Student portal"
      links={links}
      name={profile.full_name ?? ""}
      email={user.email ?? ""}
    >
      {children}
    </PortalShell>
  );
}