import { requireUser } from "@/lib/auth";
import { fmtDate, fmtMoney } from "@/lib/format";
import type { Course, EnrollmentRow } from "@/lib/types";
import { Card, EmptyState, PageHeader, StatusBadge } from "@/components/ui";
export const instant = false;
export default async function MyCoursesPage() {
  const { supabase, user } = await requireUser();

  const [{ data: enrolledData }, { data: courseData }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("id,status,batches(id,name,start_date,timing,courses(id,title,duration))")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("courses").select("*").eq("is_active", true).order("title"),
  ]);

  const enrollments = (enrolledData ?? []) as unknown as EnrollmentRow[];
  const courses = (courseData ?? []) as Course[];

  return (
    <>
      <PageHeader title="My courses" subtitle="Courses you are enrolled in." />

      {enrollments.length === 0 ? (
        <EmptyState>You are not enrolled in any course yet.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {enrollments.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  {e.batches?.courses?.title ?? "Course"}
                </h2>
                <StatusBadge status={e.status} />
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[color:var(--ink-soft)]">Batch</dt>
                  <dd className="font-medium">{e.batches?.name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[color:var(--ink-soft)]">Starts</dt>
                  <dd className="font-medium">{fmtDate(e.batches?.start_date)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[color:var(--ink-soft)]">Timing</dt>
                  <dd className="font-medium">{e.batches?.timing || "-"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[color:var(--ink-soft)]">Duration</dt>
                  <dd className="font-medium">{e.batches?.courses?.duration || "-"}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}

      <h2 className="font-display mb-4 mt-12 text-xl font-semibold tracking-tight">
        All courses at the institute
      </h2>
      {courses.length === 0 ? (
        <EmptyState>No courses have been published yet.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <Card key={c.id}>
              <h3 className="font-display text-lg font-semibold tracking-tight">{c.title}</h3>
              {c.description && (
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
                  {c.description}
                </p>
              )}
              <p className="mt-4 text-sm text-[color:var(--ink-soft)]">
                {c.duration || "Duration to be announced"} · {fmtMoney(c.fee)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}