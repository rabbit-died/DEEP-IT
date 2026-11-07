import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-[15px] text-[color:var(--ink-soft)]">{subtitle}</p>
      )}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[color:var(--line)] bg-white p-5 sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

export function Notice({ error, saved }: { error?: string; saved?: boolean }) {
  if (error) {
    return (
      <p role="alert" className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-[color:var(--danger)]">
        {error}
      </p>
    );
  }
  if (saved) {
    return (
      <p role="status" className="mb-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        Saved.
      </p>
    );
  }
  return null;
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    completed: "bg-blue-50 text-blue-700",
    dropped: "bg-slate-100 text-slate-600",
    inactive: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-[color:var(--line)] px-5 py-8 text-center text-sm text-[color:var(--ink-soft)]">
      {children}
    </p>
  );
}