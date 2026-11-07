import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { fmtMoney } from "@/lib/format";
import type { Course } from "@/lib/types";
import ConfirmButton from "@/components/ConfirmButton";
import { Card, EmptyState, Field, Notice, PageHeader, StatusBadge } from "@/components/ui";
import { createCourse, deleteCourse, toggleCourse, updateCourse } from "../actions";

export const instant = false;

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; edit?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;

  const { data } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });
  const courses = (data ?? []) as Course[];
  const editing = courses.find((c) => c.id === sp.edit) ?? null;

  return (
    <>
      <PageHeader title="Courses" subtitle="Create and manage courses." />
      <Notice error={sp.error} />

      <Card>
        <h2 className="font-display mb-5 text-lg font-semibold tracking-tight">
          {editing ? `Edit: ${editing.title}` : "Add a course"}
        </h2>
        <form
          key={editing?.id ?? "new"}
          action={editing ? updateCourse : createCourse}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="sm:col-span-2">
            <Field label="Title" htmlFor="title">
              <input id="title" name="title" required defaultValue={editing?.title ?? ""} className="field" placeholder="e.g. Full Stack Web Development" />
            </Field>
          </div>
          <Field label="Duration" htmlFor="duration">
            <input id="duration" name="duration" defaultValue={editing?.duration ?? ""} className="field" placeholder="e.g. 6 months" />
          </Field>
          <Field label="Fee (INR)" htmlFor="fee">
            <input id="fee" name="fee" type="number" min="0" step="1" defaultValue={editing?.fee ?? ""} className="field" placeholder="e.g. 15000" />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Description" htmlFor="description">
              <input id="description" name="description" defaultValue={editing?.description ?? ""} className="field" placeholder="One or two lines about the course" />
            </Field>
          </div>
          <div className="flex items-end gap-3">
            <button type="submit" className="btn-primary">
              {editing ? "Save changes" : "Add course"}
            </button>
            {editing && (
              <Link href="/admin/courses" className="shrink-0 pb-3 text-sm font-medium text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]">
                Cancel
              </Link>
            )}
          </div>
        </form>
      </Card>

      <Card className="mt-6">
        <h2 className="font-display mb-5 text-lg font-semibold tracking-tight">All courses</h2>
        {courses.length === 0 ? (
          <EmptyState>No courses yet. Add your first one above.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[color:var(--ink-soft)]">
                <tr className="border-b border-[color:var(--line)]">
                  <th className="py-3 pr-4 font-medium">Course</th>
                  <th className="py-3 pr-4 font-medium">Duration</th>
                  <th className="py-3 pr-4 font-medium">Fee</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-b border-[color:var(--line)] last:border-0">
                    <td className="py-3 pr-4 font-medium">{c.title}</td>
                    <td className="py-3 pr-4">{c.duration || "-"}</td>
                    <td className="py-3 pr-4">{fmtMoney(c.fee)}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={c.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/courses?edit=${c.id}`}
                          className="rounded-lg border border-[color:var(--line)] px-3 py-1.5 text-xs font-medium hover:bg-[color:var(--mist)]"
                        >
                          Edit
                        </Link>
                        <form action={toggleCourse}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="next" value={String(!c.is_active)} />
                          <button type="submit" className="rounded-lg border border-[color:var(--line)] px-3 py-1.5 text-xs font-medium hover:bg-[color:var(--mist)]">
                            {c.is_active ? "Hide" : "Show"}
                          </button>
                        </form>
                        <form action={deleteCourse}>
                          <input type="hidden" name="id" value={c.id} />
                          <ConfirmButton
                            message="Delete this course? Its batches and enrollments will be deleted too."
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