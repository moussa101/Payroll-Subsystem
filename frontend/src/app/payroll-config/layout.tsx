import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payroll Configuration',
  description: 'Manage payroll configurations, policies, and settings',
};

export default function PayrollConfigLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {sidebar}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

