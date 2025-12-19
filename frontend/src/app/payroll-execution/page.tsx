"use client";

import React from 'react';
import axios from 'axios';
import Link from 'next/link';
import { StatusCard } from '@/components/payroll/StatusCard';

// Mock data for initial implementation
// type PayrollCycleStatus = 'Draft' | 'Review' | 'Approved' | 'Paid' | 'Rejected';

export default function PayrollExecutionPage() {
    const [statusData, setStatusData] = React.useState<{
        status: 'Draft' | 'Review' | 'Approved' | 'Paid' | 'Rejected';
        cyclePeriod: string;
        employeeCount: number;
        totalAmount: number;
    } | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStatus = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
                
                // Replace with actual endpoint
                const response = await axios.get(`${baseUrl}/payroll-execution/status`, { headers });
                setStatusData(response.data);
            } catch (error) {
                console.error('Failed to fetch payroll status:', error);
                // Handle error or set empty state
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, []);

    const handleExecutePayment = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

            await axios.post(`${baseUrl}/payroll-execution/execute-payment`, {}, { headers });
            alert('Payment execution initiated successfully!');
        } catch (error) {
            console.error('Failed to execute payment:', error);
            alert('Failed to execute payment. Please try again.');
        }
    };

    const getActionLink = () => {
        if (!statusData) return '#';
        switch (statusData.status) {
            case 'Draft':
            case 'Rejected':
                return '/payroll-execution/initiate';
            case 'Review':
                return '/payroll-execution/review/current';
            default:
                return '#';
        }
    };

    const getActionLabel = () => {
        if (!statusData) return 'Loading...';
        switch (statusData.status) {
            case 'Draft':
                return 'Continue Initiation'; // Or Start Initiation
            case 'Rejected':
                return 'Restart Initiation';
            case 'Review':
                return 'Go to Review';
            case 'Approved':
                return 'View Summary';
            default:
                return 'Details';
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading payroll status...</div>;
    }

    if (!statusData) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Payroll Execution</h1>
                        <p className="text-gray-500 mt-1">Manage and track your payroll cycles.</p>
                    </div>
                    <Link href="/payroll-execution/initiate">
                        <button className="bg-[#0B1120] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                            Start New Cycle
                        </button>
                    </Link>
                </div>
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">No active payroll cycle found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payroll Execution</h1>
                    <p className="text-gray-500 mt-1">Manage and track your payroll cycles.</p>
                </div>
                <Link href={getActionLink()}>
                    <button className="bg-[#0B1120] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                        {getActionLabel()}
                    </button>
                </Link>
            </div>

            <div className="grid gap-6">
                <StatusCard
                    status={statusData.status}
                    cyclePeriod={statusData.cyclePeriod}
                    employeeCount={statusData.employeeCount}
                    totalAmount={statusData.totalAmount}
                />

                {/* Placeholder for recent activity or errors if needed */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-600">
                                The current payroll cycle is in <strong className="text-gray-900">{statusData.status}</strong> state. {statusData.status === 'Draft' ? 'Please complete the initiation steps.' : 'Pending review.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
