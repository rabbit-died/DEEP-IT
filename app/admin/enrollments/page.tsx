import { requireAdmin } from "@/lib/auth";
import { ENROLLMENT_STATUSES, type EnrollmentStatus } from "@/lib/types";
import ConfirmButton from "@/components/ConfirmButton";
import { Card, EmptyState, Field, Notice, PageHeader } from "@/components/ui";
import { enrollStudent, removeEnrollment, updateEnrollmentStatus } from "../actions";

type EnrollRow = {
  id: string;
  status: EnrollmentStatus;
  profiles: { full_name: string | null; email: string | null } | null;
  batches: { name: string; courses: { title: string } | null } | null;
};
export const instant = false;
export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;

  const [{ data: enrollData }, { data: studentData }, { data: batchData }] =
    await Promise.all([
      supabase
        .from("enrollments")
        .select("id,status,profiles(full_name,email),batches(name,courses(title))")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id,full_name,email")
        .eq("role", "student")
        .order("full_name"),
      supabase
        .from("batches")
        .select("id,name,courses(title)")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
    ]);

  const enrollments = (enrollData ?? []) as unknown as EnrollRow[];
  const students = (studentData ?? []) as { id: string; full_name: string | null; email: string | null }[];
  const batches = (batchData ?? []) as unknown as { id: string; name: string; courses: { title: string } | null }[];

  return (
    <>
      <PageHeader title="Enrollments" subtitle="Add students to batches and track their status." />
      <Notice error={sp.error} />

      <Card>
        <h2 className="font-display mb-5 text-lg font-semibold tracking-tight">Enroll a student</h2>
        {students.length === 0 || batches.length === 0 ? (
          <EmptyState>
            You need at least one student and one batch before you can enroll someone.
          </EmptyState>
        ) : (
          <form action={enrollStudent} className="grid gap-4 sm:grid-cols-3">
            <Field label="Student" htmlFor="student_id">
              <select id="student_id" name="student_id" required className="field">
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || "Unnamed"} ({s.email})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Batch" htmlFor="batch_id">
              <select id="batch_id" name="batch_id" required className="field">
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.courses?.title} · {b.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex items-end">
              <button type="submit" className="btn-primary">Enroll</button>
            </div>
          </form>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="font-display mb-5 text-lg font-semibold tracking-tight">All enrollments</h2>
        {enrollments.length === 0 ? (
          <EmptyState>No enrollments yet.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[color:var(--ink-soft)]">
                <tr className="border-b border-[color:var(--line)]">
                  <th className="py-3 pr-4 font-medium">Student</th>
                  <th className="py-3 pr-4 font-medium">Course / Batch</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id} className="border-b border-[color:var(--line)] last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{e.profiles?.full_name || "Unnamed"}</p>
                      <p className="text-xs text-[color:var(--ink-soft)]">{e.profiles?.email}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{e.batches?.courses?.title}</p>
                      <p className="text-xs text-[color:var(--ink-soft)]">{e.batches?.name}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <form action={updateEnrollmentStatus} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={e.id} />
                        <select
                          name="status"
                          defaultValue={e.status}
                          aria-label="Enrollment status"
                          className="rounded-lg border border-[color:var(--line)] bg-white px-2 py-1.5 text-xs capitalize"
                        >
                          {ENROLLMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button type="submit" className="rounded-lg border border-[color:var(--line)] px-3 py-1.5 text-xs font-medium hover:bg-[color:var(--mist)]">
                          Update
                        </button>
                      </form>
                    </td>
                    <td className="py-3">
                      <form action={removeEnrollment} className="flex justify-end">
                        <input type="hidden" name="id" value={e.id} />
                        <ConfirmButton
                          message="Remove this student from the batch?"
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-[color:var(--danger)] hover:bg-red-50"
                        >
                          Remove
                        </ConfirmButton>
                      </form>
                    </td>
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