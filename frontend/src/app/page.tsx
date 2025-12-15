import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 p-10 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-100">
          Payroll subsystem
        </p>
        <h1 className="mt-4 text-4xl font-semibold">
          Navigate to the new Payroll Tracking workspace
        </h1>
        <p className="mt-3 text-lg text-slate-200">
          We added claims, refunds, and disputes dashboards with a unified overview.
          Jump in to review activity and wire data to your API when ready.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/payroll-tracking"
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow transition hover:scale-[1.01] hover:shadow-lg"
          >
            Open Payroll Tracking
          </Link>
          <Link
            href="/payroll-tracking/claims"
            className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Go to Claims
          </Link>
          <Link
            href="/payroll-tracking/refunds"
            className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Refunds
          </Link>
          <Link
            href="/payroll-tracking/disputes"
            className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Disputes
          </Link>
        </div>
      </div>
    </div>
  );
}
