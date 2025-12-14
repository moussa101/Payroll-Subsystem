import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payroll Configuration',
  description: 'Manage payroll configurations, policies, and settings',
};

export default function PayrollConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}

