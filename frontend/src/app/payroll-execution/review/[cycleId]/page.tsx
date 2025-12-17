"use client";

import React, { useState } from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { PayrollTable, EmployeePayroll } from '@/components/payroll/PayrollTable';
import { CorrectionSheet, CorrectionData } from '@/components/payroll/CorrectionSheet';
import Link from 'next/link';

// Mock Data
const MOCK_EMPLOYEES: EmployeePayroll[] = [
    { id: '1', name: 'Alice Johnson', role: 'Software Engineer', grossPay: 5000, taxes: 1000, deductions: 200, netPay: 3800, hasByAnomaly: false, status: 'Ready' },
    { id: '2', name: 'Bob Smith', role: 'Product Manager', grossPay: 6000, taxes: 1200, deductions: 300, netPay: 4500, hasByAnomaly: true, anomalyMessage: 'Net pay variance > 10%', status: 'Flagged' },
    { id: '3', name: 'Charlie Brown', role: 'Designer', grossPay: 4000, taxes: 800, deductions: 100, netPay: 3100, hasByAnomaly: false, status: 'Ready' },
];

export default function ReviewPage({ params }: { params: { cycleId: string } }) {

    const [employees, setEmployees] = useState<EmployeePayroll[]>(MOCK_EMPLOYEES);
    const [selectedEmployee, setSelectedEmployee] = useState<CorrectionData | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleCorrect = (employee: EmployeePayroll) => {
        setSelectedEmployee({
            employeeId: employee.id,
            employeeName: employee.name,
            grossPay: employee.grossPay,
            taxes: employee.taxes,
            deductions: employee.deductions,
            netPay: employee.netPay
        });
        setIsSheetOpen(true);
    };

    const handleSaveCorrection = (data: CorrectionData) => {
        setEmployees(employees.map(emp =>
            emp.id === data.employeeId
                ? {
                    ...emp,
                    grossPay: data.grossPay,
                    taxes: data.taxes,
                    deductions: data.deductions,
                    netPay: data.netPay,
                    status: 'Corrected',
                    hasByAnomaly: false
                }
                : emp
        ));
        setIsSheetOpen(false);
        setSelectedEmployee(null);
    };

    const hasErrors = employees.some(e => e.hasByAnomaly);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <Link href="/payroll-execution" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2 inline-block">
                        &larr; Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Review Payroll Draft</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cycle ID: {Math.floor(Math.random() * 1000)} {/* Just a placeholder for cycleId param */}</p>
                </div>
                <div>
                    <Button variant="primary" disabled={hasErrors} onClick={() => alert("Published for Manager Review!")}>
                        Publish for Manager Review
                    </Button>
                </div>
            </div>

            {hasErrors && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Attention needed</h3>
                            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                <p>There are employees with detected anomalies. Please review and correct them before publishing.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <PayrollTable data={employees} onCorrect={handleCorrect} />

            <CorrectionSheet
                employee={selectedEmployee}
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onSave={handleSaveCorrection}
            />
        </div>
    );
}
