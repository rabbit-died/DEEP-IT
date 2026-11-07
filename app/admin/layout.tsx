import PortalShell from "@/components/PortalShell";
import { requireAdmin } from "@/lib/auth";
export const instant = false;
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAdmin();

  const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/students", label: "Students" },
    { href: "/admin/courses", label: "Courses" },
    { href: "/admin/batches", label: "Batches" },
    { href: "/admin/enrollments", label: "Enrollments" },
    { href: "/dashboard", label: "Student view" },
  ];

  return (
    <PortalShell
      title="Admin panel"
      links={links}
      name={profile.full_name ?? "Admin"}
      email={user.email ?? ""}
    >
      {children}
    </PortalShell>
  );
}