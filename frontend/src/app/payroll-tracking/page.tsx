import { DataTable, MetricCard, SectionCard, StatusPill } from "./components";
import { getApiBaseUrl, getClaims, getDisputes, getRefunds } from "./api";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function PayrollTrackingPage() {
  const [liveClaims, liveDisputes, liveRefunds] = await Promise.all([
    getClaims().catch(() => []),
    getDisputes().catch(() => []),
    getRefunds().catch(() => []),
  ]);
  const apiBase = getApiBaseUrl();

  const claims = liveClaims;
  const disputes = liveDisputes;
  const refunds = liveRefunds;

  const openClaims = claims.filter(
    (c) => c.status !== "approved" && c.status !== "rejected",
  ).length;
  const openDisputes = disputes.filter(
    (d) => d.status !== "approved" && d.status !== "rejected",
  ).length;
  const pendingRefunds = refunds.filter((r) => r.status !== "paid").length;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 px-6 py-8 shadow-xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-100">
              Overview
            </p>
            <h1 className="text-3xl font-semibold text-white">
              Payroll tracking cockpit
            </h1>
            <p className="max-w-2xl text-lg text-slate-200">
              Monitor employee claims, disputes, and payroll refunds from one
              compact workspace. Use the quick links to drill into each queue.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-emerald-200/25 px-3 py-1 text-emerald-100 ring-1 ring-emerald-200/50">
                Finance + Payroll visibility
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-white">
                Status-aware summaries
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-white">
                Actionable quick links
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MetricCard
              label="Open claims"
              value={openClaims.toString()}
              hint={`${claims.length} total`}
              accent="emerald"
            />
            <MetricCard
              label="Pending refunds"
              value={pendingRefunds.toString()}
              hint={`${refunds.length} total`}
              accent="amber"
            />
            <MetricCard
              label="Disputes in play"
              value={openDisputes.toString()}
              hint={`${disputes.length} total`}
              accent="indigo"
            />
            <MetricCard
              label="Latest payout"
              value={
                refunds.length ? currency.format(refunds[0].amount) : currency.format(0)
              }
              hint={
                refunds.length
                  ? `Run ${refunds[0].payrollRun}`
                  : "No payroll run scheduled"
              }
              accent="rose"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Claims"
          description="Newest submissions across employees"
          actionHref="/payroll-tracking/claims"
          actionLabel="View claims"
        >
          <DataTable
            columns={[
              { key: "claimId", label: "ID" },
              { key: "employee", label: "Employee" },
              { key: "description", label: "Description", className: "max-w-xs" },
              {
                key: "amount",
                label: "Amount",
                render: (row) => currency.format(row.amount),
              },
              {
                key: "status",
                label: "Status",
                render: (row) => <StatusPill status={row.status} />,
              },
            ]}
            rows={claims.slice(0, 3)}
            empty="No claims captured"
          />
        </SectionCard>

        <SectionCard
          title="Refunds"
          description="Scheduled or completed payouts"
          actionHref="/payroll-tracking/refunds"
          actionLabel="View refunds"
        >
          <DataTable
            columns={[
              { key: "refundId", label: "ID" },
              {
                key: "reference",
                label: "Linked to",
                render: (row) => (
                  <div className="space-y-1">
                    <p className="font-semibold">{row.reference}</p>
                    <p className="text-xs text-slate-300">{row.reason}</p>
                  </div>
                ),
              },
              {
                key: "amount",
                label: "Amount",
                render: (row) => currency.format(row.amount),
              },
              {
                key: "status",
                label: "Status",
                render: (row) => <StatusPill status={row.status} />,
              },
            ]}
            rows={refunds.slice(0, 3)}
            empty="No refunds queued"
          />
        </SectionCard>

        <SectionCard
          title="Disputes"
          description="Issues raised against payroll runs"
          actionHref="/payroll-tracking/disputes"
          actionLabel="View disputes"
        >
          <DataTable
            columns={[
              { key: "disputeId", label: "ID" },
              { key: "employee", label: "Employee" },
              { key: "payslipId", label: "Payslip" },
              {
                key: "status",
                label: "Status",
                render: (row) => <StatusPill status={row.status} />,
              },
            ]}
            rows={disputes.slice(0, 4)}
            empty="No disputes active"
          />
        </SectionCard>
      </div>

      <SectionCard
        title="Live activity"
        description="Real-time events can be pulled once an activity feed endpoint is exposed."
      >
        <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-6 text-sm text-slate-200">
          No activity feed endpoint is connected yet. Expose a feed from the backend (e.g. recent claims/disputes/refunds updates) and hydrate this block.
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm text-slate-200">
          <a
            className="rounded-full border border-white/30 px-4 py-2 font-semibold hover:bg-white/10"
            href={`${apiBase}/tax/document/${new Date().getFullYear()}`}
          >
            Download current year tax document
          </a>
        </div>
      </SectionCard>
    </div>
  );
}
