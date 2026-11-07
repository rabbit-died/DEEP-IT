import { requireAdmin } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import type { Profile } from "@/lib/types";
import { Card, EmptyState, PageHeader } from "@/components/ui";
export const instant = false;
export default async function AdminOverviewPage() {
  const { supabase } = await requireAdmin();

  const count = (table: string, role?: string) => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (role) q = q.eq("role", role);
    return q;
  };

  const [students, courses, batches, enrollments, recent] = await Promise.all([
    count("profiles", "student"),
    count("courses"),
    count("batches"),
    count("enrollments"),
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Students", value: students.count ?? 0 },
    { label: "Courses", value: courses.count ?? 0 },
    { label: "Batches", value: batches.count ?? 0 },
    { label: "Enrollments", value: enrollments.count ?? 0 },
  ];
  const recentStudents = (recent.data ?? []) as Profile[];

  return (
    <>
      <PageHeader title="Admin overview" subtitle="A quick look at the institute." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-[color:var(--ink-soft)]">{s.label}</p>
            <p className="font-display mt-1 text-4xl font-semibold tracking-tight">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <h2 className="font-display mb-5 text-lg font-semibold tracking-tight">Newest students</h2>
        {recentStudents.length === 0 ? (
          <EmptyState>No students have signed up yet.</EmptyState>
        ) : (
          <ul className="divide-y divide-[color:var(--line)]">
            {recentStudents.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium">{s.full_name || "Unnamed"}</p>
                  <p className="text-sm text-[color:var(--ink-soft)]">{s.email}</p>
                </div>
                <p className="text-sm text-[color:var(--ink-soft)]">Joined {fmtDate(s.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}