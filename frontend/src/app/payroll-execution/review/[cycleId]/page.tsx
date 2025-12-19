"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PayrollTable, EmployeePayroll } from '@/components/payroll/PayrollTable';
import { CorrectionSheet, CorrectionData } from '@/components/payroll/CorrectionSheet';
import Link from 'next/link';

// Mock Data
const MOCK_EMPLOYEES: EmployeePayroll[] = [
    { id: '1', name: 'Alice Johnson', role: 'Software Engineer', grossPay: 5000, taxes: 1000, deductions: 200, netPay: 3800, hasByAnomaly: false, status: 'Ready' },
    { id: '2', name: 'Bob Smith', role: 'Product Manager', grossPay: 6000, taxes: 1200, deductions: 300, netPay: 4500, hasByAnomaly: true, anomalyMessage: 'Net pay variance > 10%', status: 'Flagged' },
    { id: '3', name: 'Charlie Brown', role: 'Designer', grossPay: 4000, taxes: 800, deductions: 100, netPay: 3100, hasByAnomaly: false, status: 'Ready' },
];

import { hasAnyRole, getToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

// ... (existing imports)

export default function ReviewPage({ params }: { params: { cycleId: string } }) {
    const router = useRouter();
    const [employees, setEmployees] = useState<EmployeePayroll[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<CorrectionData | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    React.useEffect(() => {
        const authorized = hasAnyRole([
            'Payroll Specialist',
            'Payroll Manager',
            'System Admin'
        ]);

        if (!authorized) {
            router.push('/payroll-execution');
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    if (!isAuthorized) return null;

    const fetchEmployees = async () => {
        try {
            const token = getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

            const response = await axios.get(`${baseUrl}/payroll-execution/drafts/${params.cycleId}`, { headers });
            setEmployees(response.data);
        } catch (error) {
            console.error('Failed to fetch draft entries:', error);
            // Handle error appropriately
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchEmployees();
    }, [params.cycleId]);

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

    const handleSaveCorrection = async (data: CorrectionData) => {
        try {
            const token = getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

            await axios.patch(`${baseUrl}/payroll-execution/payslip/${data.employeeId}`, data, { headers });

            // Refresh list after correction
            await fetchEmployees();

            setIsSheetOpen(false);
            setSelectedEmployee(null);
        } catch (error) {
            console.error('Failed to save correction:', error);
            alert('Failed to save correction. Please try again.');
        }
    };

    const handlePublish = async () => {
        try {
            const token = getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

            await axios.post(`${baseUrl}/payroll-execution/review`, {
                runId: params.cycleId,
                action: 'approve', // Assuming 'approve' is the action for publishing to manager
                comments: 'Published for manager review'
            }, { headers });

            alert("Published for Manager Review!");
            // Redirect or update UI state
        } catch (error) {
            console.error('Failed to publish review:', error);
            alert('Failed to publish review. Please try again.');
        }
    };

    const hasErrors = employees.some(e => e.hasByAnomaly);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Link href="/payroll-execution" className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 inline-flex items-center transition-colors">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">Review Payroll Draft</h1>
                    <p className="text-gray-500 mt-1">Review employee payslips and correct anomalies.</p>
                </div>
                <div>
                    <Button variant="default" disabled={hasErrors} onClick={handlePublish}>
                        Publish for Manager Review
                    </Button>
                <div className="flex gap-3">
                    <button 
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
                    >
                        Export Report
                    </button>
                    <button 
                        onClick={handlePublish}
                        disabled={hasErrors}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all
                            ${hasErrors 
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : 'bg-[#0B1120] hover:bg-gray-800 hover:shadow-md'
                            }`}
                    >
                        Publish for Approval
                    </button>
                </div>
            </div>

            {hasErrors && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                    <svg className="h-5 w-5 text-red-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Attention Needed</h3>
                        <p className="text-sm text-red-700 mt-1">
                            There are flagged entries that require correction before you can publish this payroll run.
                        </p>
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
