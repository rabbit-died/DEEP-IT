import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import ConfirmButton from "@/components/ConfirmButton";
import { Card, EmptyState, Field, Notice, PageHeader } from "@/components/ui";
import { createBatch, deleteBatch, updateBatch } from "../actions";

export const instant = false;

type BatchRow = {
  id: string;
  course_id: string;
  name: string;
  start_date: string | null;
  timing: string | null;
  seats: number | null;
  courses: { title: string } | null;
  enrollments: { count: number }[];
};

export default async function AdminBatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; edit?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;

  const [{ data: batchData }, { data: courseData }] = await Promise.all([
    supabase
      .from("batches")
      .select("id,course_id,name,start_date,timing,seats,courses(title),enrollments(count)")
      .order("start_date", { ascending: false }),
    supabase.from("courses").select("id,title").order("title"),
  ]);

  const batches = (batchData ?? []) as unknown as BatchRow[];
  const courses = (courseData ?? []) as { id: string; title: string }[];
  const editing = batches.find((b) => b.id === sp.edit) ?? null;

  return (
    <>
      <PageHeader title="Batches" subtitle="Create batches under a course." />
      <Notice error={sp.error} />

      <Card>
        <h2 className="font-display mb-5 text-lg font-semibold tracking-tight">
          {editing ? `Edit: ${editing.name}` : "Add a batch"}
        </h2>
        {courses.length === 0 ? (
          <EmptyState>Add a course first, then you can create batches for it.</EmptyState>
        ) : (
          <form
            key={editing?.id ?? "new"}
            action={editing ? updateBatch : createBatch}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <Field label="Course" htmlFor="course_id">
              <select id="course_id" name="course_id" required defaultValue={editing?.course_id ?? courses[0].id} className="field">
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </Field>
            <Field label="Batch name" htmlFor="name">
              <input id="name" name="name" required defaultValue={editing?.name ?? ""} className="field" placeholder="e.g. Morning Batch Jan 2027" />
            </Field>
            <Field label="Start date" htmlFor="start_date">
              <input id="start_date" name="start_date" type="date" defaultValue={editing?.start_date ?? ""} className="field" />
            </Field>
            <Field label="Timing" htmlFor="timing">
              <input id="timing" name="timing" defaultValue={editing?.timing ?? ""} className="field" placeholder="e.g. Mon-Fri, 7-9 AM" />
            </Field>
            <Field label="Seats" htmlFor="seats">
              <input id="seats" name="seats" type="number" min="0" defaultValue={editing?.seats ?? ""} className="field" placeholder="e.g. 30" />
            </Field>
            <div className="flex items-end gap-3">
              <button type="submit" className="btn-primary">
                {editing ? "Save changes" : "Add batch"}
              </button>
              {editing && (
                <Link href="/admin/batches" className="shrink-0 pb-3 text-sm font-medium text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]">
                  Cancel
                </Link>
              )}
            </div>
          </form>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="font-display mb-5 text-lg font-semibold tracking-tight">All batches</h2>
        {batches.length === 0 ? (
          <EmptyState>No batches yet.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[color:var(--ink-soft)]">
                <tr className="border-b border-[color:var(--line)]">
                  <th className="py-3 pr-4 font-medium">Batch</th>
                  <th className="py-3 pr-4 font-medium">Course</th>
                  <th className="py-3 pr-4 font-medium">Starts</th>
                  <th className="py-3 pr-4 font-medium">Timing</th>
                  <th className="py-3 pr-4 font-medium">Students</th>
                  <th className="py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id} className="border-b border-[color:var(--line)] last:border-0">
                    <td className="py-3 pr-4 font-medium">{b.name}</td>
                    <td className="py-3 pr-4">{b.courses?.title}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{fmtDate(b.start_date)}</td>
                    <td className="py-3 pr-4">{b.timing || "-"}</td>
                    <td className="py-3 pr-4">
                      {b.enrollments?.[0]?.count ?? 0}
                      {b.seats ? ` / ${b.seats}` : ""}
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/batches?edit=${b.id}`}
                          className="rounded-lg border border-[color:var(--line)] px-3 py-1.5 text-xs font-medium hover:bg-[color:var(--mist)]"
                        >
                          Edit
                        </Link>
                        <form action={deleteBatch}>
                          <input type="hidden" name="id" value={b.id} />
                          <ConfirmButton
                            message="Delete this batch? Student enrollments in it will be removed."
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-[color:var(--danger)] hover:bg-red-50"
                          >
                            Delete
                          </ConfirmButton>
                        </form>
                      </div>
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