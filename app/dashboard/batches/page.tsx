import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import { Card, EmptyState, PageHeader } from "@/components/ui";
export const instant = false;
type BatchRow = {
  id: string;
  name: string;
  start_date: string | null;
  timing: string | null;
  seats: number | null;
  courses: { title: string } | null;
};

export default async function BatchesPage() {
  const { supabase, user } = await requireUser();

  const [{ data: batchData }, { data: mine }] = await Promise.all([
    supabase
      .from("batches")
      .select("id,name,start_date,timing,seats,courses(title)")
      .eq("is_active", true)
      .order("start_date", { ascending: true }),
    supabase.from("enrollments").select("batch_id").eq("student_id", user.id),
  ]);

  const batches = (batchData ?? []) as unknown as BatchRow[];
  const enrolledIds = new Set(
    ((mine ?? []) as { batch_id: string }[]).map((m) => m.batch_id)
  );

  return (
    <>
      <PageHeader title="Batches" subtitle="Running and upcoming batches." />

      {batches.length === 0 ? (
        <EmptyState>No batches have been announced yet.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {batches.map((b) => (
            <Card key={b.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold tracking-tight">{b.name}</h2>
                  <p className="mt-0.5 text-sm text-[color:var(--ink-soft)]">
                    {b.courses?.title}
                  </p>
                </div>
                {enrolledIds.has(b.id) && (
                  <span className="rounded-full bg-[color:var(--accent)] px-2.5 py-0.5 text-xs font-medium text-white">
                    Enrolled
                  </span>
                )}
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[color:var(--ink-soft)]">Starts</dt>
                  <dd className="font-medium">{fmtDate(b.start_date)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[color:var(--ink-soft)]">Timing</dt>
                  <dd className="font-medium">{b.timing || "-"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[color:var(--ink-soft)]">Seats</dt>
                  <dd className="font-medium">{b.seats ?? "-"}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}