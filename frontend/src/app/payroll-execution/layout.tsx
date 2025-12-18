import { PayrollProvider } from '@/context/PayrollContext';

export default function PayrollExecutionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PayrollProvider>
            <div className="p-6">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Payroll Execution</h1>
                    <p className="text-gray-600">Manage and process payroll cycles</p>
                </header>
                {children}
            </div>
        </PayrollProvider>
    );
}
