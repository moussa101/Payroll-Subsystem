import React from 'react';
import { PayrollProvider } from '@/context/PayrollContext';
import { AppShell } from '@/components/layout/app-shell';

export default function PayrollExecutionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PayrollProvider>
            <AppShell title="Payroll Execution" subtitle="Manage and process payroll cycles">
                {children}
            </AppShell>
        </PayrollProvider>
    );
}
