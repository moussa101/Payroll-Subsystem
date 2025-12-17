import { DataTable, MetricCard, SectionCard, StatusPill } from "../components";
import { getClaims } from "../api";
import { ClaimActions } from "../actions";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function ClaimsPage() {
  const claims = await getClaims().catch(() => []);

  const approved = claims.filter((c) => c.status === "approved").length;
  const rejected = claims.filter((c) => c.status === "rejected").length;
  const waiting = claims.length - approved - rejected;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Open claims"
          value={waiting.toString()}
          hint="Under review or pending approval"
          accent="emerald"
        />
        <MetricCard
          label="Approved"
          value={approved.toString()}
          hint="Ready for payout"
          accent="indigo"
        />
        <MetricCard
          label="Rejected"
          value={rejected.toString()}
          hint="With feedback shared"
          accent="rose"
        />
      </div>

      <SectionCard
        title="Claims queue"
        description="Full list of employee claims with finance ownership"
      >
        <DataTable
          columns={[
            {
              key: "claimId",
              label: "Claim",
              render: (row) => (
                <div className="space-y-1">
                  <p className="font-semibold">{row.claimId}</p>
                  <p className="text-xs text-slate-300">{row.claimType}</p>
                </div>
              ),
            },
            { key: "employee", label: "Employee" },
            {
              key: "description",
              label: "Description",
              className: "max-w-md",
            },
            {
              key: "amount",
              label: "Amount",
              render: (row) => (
                <div className="space-y-1">
                  <p className="font-semibold">{currency.format(row.amount)}</p>
                  {row.approvedAmount !== undefined ? (
                    <p className="text-xs text-emerald-200">
                      Approved: {currency.format(row.approvedAmount)}
                    </p>
                  ) : null}
                </div>
              ),
            },
            {
              key: "financeOwner",
              label: "Finance",
              render: (row) => (
                <div className="space-y-1">
                  <p className="font-semibold">{row.financeOwner}</p>
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
              render: (row) => <ClaimActions claim={row} />,
            },
          ]}
          rows={claims}
          empty="No claims yet"
        />
        <p className="mt-4 text-sm text-slate-300">
          Data loads from <code>{process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000"}/claims</code>. If the request
          fails, the table will be empty.
        </p>
      </SectionCard>
    </div>
  );
}
