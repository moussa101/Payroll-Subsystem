import { DataTable, MetricCard, SectionCard, StatusPill } from "../components";
import { getDisputes } from "../api";
import { DisputeActions } from "../actions";

export default async function DisputesPage() {
  const disputes = await getDisputes().catch(() => []);

  const underReview = disputes.filter((d) =>
    d.status.toLowerCase().includes("review"),
  ).length;
  const escalated = disputes.filter((d) =>
    d.status.toLowerCase().includes("pending"),
  ).length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Under review"
          value={underReview.toString()}
          hint="Initial payroll checks"
          accent="indigo"
        />
        <MetricCard
          label="Awaiting manager"
          value={escalated.toString()}
          hint="Pending payroll manager approval"
          accent="amber"
        />
        <MetricCard
          label="Total disputes"
          value={disputes.length.toString()}
          hint="Current cycle"
          accent="emerald"
        />
      </div>

      <SectionCard
        title="Dispute log"
        description="Every dispute tied to its payslip and payroll owner"
      >
        <DataTable
          columns={[
            { key: "disputeId", label: "Dispute" },
            {
              key: "description",
              label: "Description",
              className: "max-w-md",
            },
            { key: "employee", label: "Employee" },
            { key: "payslipId", label: "Payslip" },
            {
              key: "payrollOwner",
              label: "Owner",
              render: (row) => (
                <div className="space-y-1">
                  <p className="font-semibold">{row.payrollOwner}</p>
                  <p className="text-xs text-slate-300">Updated {row.updatedOn}</p>
                </div>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (row) => <StatusPill status={row.status} />,
            },
            {
              key: "statusHistory",
              label: "History",
              render: (row) =>
                row.statusHistory && row.statusHistory.length ? (
                  <div className="space-y-1 text-xs text-slate-200">
                    {row.statusHistory.slice(-3).map((h, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-semibold">
                          {h.status}
                        </span>
                        <span className="text-slate-400">
                          {h.at ? new Date(h.at).toLocaleDateString() : ""}
                        </span>
                        {h.note ? <span className="text-slate-300">• {h.note}</span> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (row) => <DisputeActions dispute={row} />,
            },
          ]}
          rows={disputes}
          empty="No disputes opened"
        />
        <p className="mt-4 text-sm text-slate-300">
          Data loads from <code>{process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000"}/disputes</code>. If the
          request fails, the table will be empty.
        </p>
      </SectionCard>
    </div>
  );
}
