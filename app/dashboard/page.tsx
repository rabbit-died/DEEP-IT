import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import type { EnrollmentRow } from "@/lib/types";
import { Card, EmptyState, StatusBadge } from "@/components/ui";
export const instant = false;
export default async function DashboardPage() {
  const { supabase, user, profile } = await requireUser();

  const { data } = await supabase
    .from("enrollments")
    .select(
      "id,status,batches(id,name,start_date,timing,courses(id,title,duration))"
    )
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  const enrollments = (data ?? []) as unknown as EnrollmentRow[];
  const active = enrollments.filter((e) => e.status === "active");
  const completed = enrollments.filter((e) => e.status === "completed");
  const courseCount = new Set(
    enrollments.map((e) => e.batches?.courses?.id).filter(Boolean)
  ).size;

  const firstName = (profile.full_name ?? "").split(" ")[0] || "there";

  const stats = [
    { label: "Courses", value: courseCount },
    { label: "Active batches", value: active.length },
    { label: "Completed", value: completed.length },
  ];

  return (
    <>
      <section className="depth-panel rounded-2xl p-8 text-white sm:p-10">
        <p className="text-sm text-white/60">Student portal</p>
        <h1 className="font-display mt-2 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Welcome, {firstName}.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
          Your courses, batches and profile in one place.
        </p>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-[color:var(--ink-soft)]">{s.label}</p>
            <p className="font-display mt-1 text-4xl font-semibold tracking-tight">
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <h2 className="font-display mb-5 text-lg font-semibold tracking-tight">
          Your batches
        </h2>
        {enrollments.length === 0 ? (
          <EmptyState>
            You are not enrolled in any batch yet. The institute will add you to
            a batch, and it will show up here.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-[color:var(--line)]">
            {enrollments.slice(0, 5).map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium">{e.batches?.courses?.title ?? "Course"}</p>
                  <p className="mt-0.5 text-sm text-[color:var(--ink-soft)]">
                    {e.batches?.name} · Starts {fmtDate(e.batches?.start_date)}
                    {e.batches?.timing ? ` · ${e.batches.timing}` : ""}
                  </p>
                </div>
                <StatusBadge status={e.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}