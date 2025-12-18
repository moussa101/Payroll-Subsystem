"use client";

import React from 'react';
import axios from 'axios';
import Link from 'next/link';
import { StatusCard } from '@/components/payroll/StatusCard';
import { Button } from '@/components/ui/Button';

// Mock data for initial implementation
type PayrollCycleStatus = 'Draft' | 'Review' | 'Approved' | 'Paid' | 'Rejected';

const MOCK_DATA: {
    status: PayrollCycleStatus;
    cyclePeriod: string;
    employeeCount: number;
    totalAmount: number;
} = {
    status: 'Draft',
    cyclePeriod: 'December 2025',
    employeeCount: 142,
    totalAmount: 452000,
};

export default function PayrollExecutionPage() {
    const { status } = MOCK_DATA;

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
        switch (status) {
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
        switch (status) {
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payroll Execution</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track your payroll cycles.</p>
                </div>
                <Link href={getActionLink()}>
                    <Button variant="primary" size="lg">
                        {getActionLabel()}
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6">
                <StatusCard
                    status={status}
                    cyclePeriod={MOCK_DATA.cyclePeriod}
                    employeeCount={MOCK_DATA.employeeCount}
                    totalAmount={MOCK_DATA.totalAmount}
                />

                {/* Placeholder for recent activity or errors if needed */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r shadow-sm">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700 dark:text-blue-200">
                                The current payroll cycle is in <strong>{status}</strong> state. {status === 'Draft' ? 'Please complete the initiation steps.' : 'Pending review.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
