'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const tabs = [
  { href: "/payroll-tracking", label: "Overview" },
  { href: "/payroll-tracking/claims", label: "Claims" },
  { href: "/payroll-tracking/refunds", label: "Refunds" },
  { href: "/payroll-tracking/disputes", label: "Disputes" },
];

export default function PayrollTrackingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.08),transparent_25%),radial-gradient(circle_at_80%_70%,rgba(234,179,8,0.08),transparent_25%)]" />
      <header className="sticky top-0 z-20 border-b border-white/10 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
              Payroll tracking
            </p>
            <h1 className="text-xl font-semibold text-white">
              Claims, Refunds & Disputes
            </h1>
          </div>
          <nav className="flex items-center gap-2 rounded-full bg-white/5 p-1 text-sm">
            {tabs.map((tab) => {
              const isActive =
                pathname === tab.href ||
                (tab.href !== "/payroll-tracking" &&
                  pathname.startsWith(tab.href));
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`rounded-full px-4 py-2 transition-colors ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-8">{children}</main>
    </div>
  );
}
