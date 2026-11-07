import { requireAdmin } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import type { Profile } from "@/lib/types";
import { Card, EmptyState, PageHeader } from "@/components/ui";

type StudentRow = Profile & { enrollments: { count: number }[] };
export const instant = false;
export default async function AdminStudentsPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("profiles")
    .select("*, enrollments(count)")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  const students = (data ?? []) as unknown as StudentRow[];

  return (
    <>
      <PageHeader title="Students" subtitle={`${students.length} registered`} />
      <Card>
        {students.length === 0 ? (
          <EmptyState>No students have signed up yet.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[color:var(--ink-soft)]">
                <tr className="border-b border-[color:var(--line)]">
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="py-3 pr-4 font-medium">Email</th>
                  <th className="py-3 pr-4 font-medium">Phone</th>
                  <th className="py-3 pr-4 font-medium">Batches</th>
                  <th className="py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-[color:var(--line)] last:border-0">
                    <td className="py-3 pr-4 font-medium">{s.full_name || "Unnamed"}</td>
                    <td className="py-3 pr-4">{s.email}</td>
                    <td className="py-3 pr-4">{s.phone || "-"}</td>
                    <td className="py-3 pr-4">{s.enrollments?.[0]?.count ?? 0}</td>
                    <td className="whitespace-nowrap py-3">{fmtDate(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}