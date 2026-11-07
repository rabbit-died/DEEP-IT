import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import { Card, Field, Notice, PageHeader } from "@/components/ui";
import { updateProfile } from "./actions";

export const instant = false;

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { user, profile } = await requireUser();
  const sp = await searchParams;

  return (
    <>
      <PageHeader title="Profile" subtitle="Your personal details." />
      <Notice error={sp.error} saved={sp.saved === "1"} />

      <Card className="max-w-xl">
        <form action={updateProfile} className="flex flex-col gap-5">
          <Field label="Full name" htmlFor="full_name">
            <input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={profile.full_name ?? ""}
              autoComplete="name"
              className="field"
            />
          </Field>
          <Field label="Email address" htmlFor="email">
            <input
              id="email"
              type="email"
              value={user.email ?? ""}
              readOnly
              className="field bg-[color:var(--mist)] text-[color:var(--ink-soft)]"
            />
          </Field>
          <Field label="Phone number" htmlFor="phone">
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone ?? ""}
              autoComplete="tel"
              placeholder="10-digit mobile number"
              className="field"
            />
          </Field>
          <p className="text-sm text-[color:var(--ink-soft)]">
            Member since {fmtDate(profile.created_at)}
          </p>
          <button type="submit" className="btn-primary">
            Save changes
          </button>
        </form>
      </Card>
    </>
  );
}