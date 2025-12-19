import Link from "next/link";
import type { ReactNode } from "react";

export function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  const tone =
    normalized.includes("approved") || normalized.includes("paid")
      ? "bg-emerald-200/80 text-emerald-900 ring-1 ring-emerald-200"
      : normalized.includes("pending")
      ? "bg-amber-100/80 text-amber-900 ring-1 ring-amber-200"
      : normalized.includes("rejected")
      ? "bg-rose-100/80 text-rose-900 ring-1 ring-rose-200"
      : "bg-sky-100/70 text-sky-900 ring-1 ring-sky-200";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      {status}
    </span>
  );
}

export function SectionCard({
  title,
  description,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-emerald-200/[0.06]" />
      <header className="relative mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description ? (
            <p className="text-sm text-slate-300">{description}</p>
          ) : null}
        </div>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-semibold shadow-sm transition hover:scale-[1.01] hover:shadow"
          >
            {actionLabel}
          </Link>
        ) : null}
      </header>
      <div className="relative">{children}</div>
    </section>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "emerald" | "amber" | "indigo" | "rose";
}) {
  const accents: Record<string, string> = {
    emerald: "bg-emerald-400/20 text-emerald-100 border-emerald-200/30",
    amber: "bg-amber-400/20 text-amber-100 border-amber-200/30",
    indigo: "bg-indigo-400/20 text-indigo-100 border-indigo-200/30",
    rose: "bg-rose-400/20 text-rose-100 border-rose-200/30",
  };

  const accentClass = accent ? accents[accent] : "bg-white/5 text-white";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${accentClass}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-white/80">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="text-sm text-white/80">{hint}</p> : null}
    </div>
  );
}

type Column<T> = {
  key: keyof T;
  label: string;
  className?: string;
  render?: (item: T) => ReactNode;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/40">
      <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-100">
        <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-300">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className={`px-4 py-3 ${col.className ?? ""}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-slate-400"
              >
                {empty ?? "No records yet"}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-white/5 last:border-none hover:bg-white/[0.03]"
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className={`px-4 py-4 ${col.className ?? ""}`}>
                    {col.render ? col.render(row) : (row[col.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
