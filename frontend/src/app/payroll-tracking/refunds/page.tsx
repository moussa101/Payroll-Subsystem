import { DataTable, MetricCard, SectionCard, StatusPill } from "../components";
import { getRefunds } from "../api";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function RefundsPage() {
  const refunds = await getRefunds().catch(() => []);

  const paid = refunds.filter((r) => r.status === "paid").length;
  const pending = refunds.length - paid;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Pending refunds"
          value={pending.toString()}
          hint="Queued for the next payroll run"
          accent="amber"
        />
        <MetricCard
          label="Paid this cycle"
          value={paid.toString()}
          hint="Cleared with payroll"
          accent="emerald"
        />
        <MetricCard
          label="Largest pending"
          value={
            refunds.length
              ? currency.format(Math.max(...refunds.map((r) => r.amount)))
              : currency.format(0)
          }
          hint="Based on current list"
          accent="indigo"
        />
        <MetricCard
          label="Next payroll run"
          value={refunds[0]?.payrollRun ?? "Not scheduled"}
          hint="From top of queue"
          accent="rose"
        />
      </div>

      <SectionCard
        title="Refund schedule"
        description="Visibility into refunds tied to claims and disputes"
      >
        <DataTable
          columns={[
            { key: "refundId", label: "Refund" },
            {
              key: "reference",
              label: "Reference",
              render: (row) => (
                <div className="space-y-1">
                  <p className="font-semibold">
                    {row.reference} <span className="text-xs text-slate-300">({row.referenceType})</span>
                  </p>
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
              key: "payrollRun",
              label: "Payroll run",
              render: (row) => (
                <div className="space-y-1">
                  <p className="font-semibold">{row.payrollRun ?? "Unscheduled"}</p>
                  <p className="text-xs text-slate-300">Updated {row.updatedOn}</p>
                </div>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (row) => <StatusPill status={row.status} />,
            },
          ]}
          rows={refunds}
          empty="No refunds in the queue"
        />
        <p className="mt-4 text-sm text-slate-300">
          Data loads from <code>{process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000"}/refunds</code>. If the request
          fails, the table will be empty.
        </p>
      </SectionCard>
    </div>
  );
}
