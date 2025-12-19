"use client";

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PreRunCheckList } from '@/components/payroll/PreRunCheckList';
import { FormInput } from '@/components/ui/FormInput'; // Reusing FormInput for date/select if possible, otherwise standard select

const MOCK_CHECKS = [
    { id: '1', description: 'Pending termination benefits verified', resolved: false },
    { id: '2', description: 'New hire documents signed', resolved: false },
    { id: '3', description: 'Bonus approvals completed', resolved: true },
];

import { hasAnyRole, getToken } from '@/lib/auth';

// ... (existing imports)

export default function InitiationPage() {
    const router = useRouter();
    const [period, setPeriod] = useState('2025-12');
    const [checks, setChecks] = useState(MOCK_CHECKS);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    React.useEffect(() => {
        const authorized = hasAnyRole([
            'Payroll Specialist',
            'Payroll Manager',
            'System Admin'
        ]);

        if (!authorized) {
            // Redirect unauthorized users
            router.push('/payroll-execution');
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    if (!isAuthorized) {
        return null;
    }

    const handleToggleCheck = (id: string, resolved: boolean) => {
        setChecks(checks.map(c => c.id === id ? { ...c, resolved } : c));
    };

    const allChecksResolved = checks.every(c => c.resolved);

    const handleGenerateDraft = async () => {
        setIsGenerating(true);
        try {
            const token = getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

            await axios.post(`${baseUrl}/payroll-execution/initiate`, { period }, { headers });

            // Navigate to review page (assuming backend returns ID or we redirect to current)
            // For now redirecting to review/current as per common pattern or specific ID if available
            router.push('/payroll-execution/review/current');
        } catch (error) {
            console.error('Failed to initiate payroll:', error);
            alert('Failed to initiate payroll run. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="mb-8">
                <Link href="/payroll-execution" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 inline-block">
                    &larr; Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Initiate Payroll Run</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Select period and verify pre-run conditions.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Run Details</h2>
                <div className="mb-6">
                    <label htmlFor="period-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payroll Period</label>
                    <input
                        type="month"
                        id="period-select"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                    />
                </div>

                <PreRunCheckList checks={checks} onToggleCheck={handleToggleCheck} />
            </div>

            <div className="flex justify-end">
                <Button
                    variant="default"
                    size="lg"
                    onClick={handleGenerateDraft}
                    disabled={!allChecksResolved || isGenerating}
                >
                    {isGenerating ? 'Generating Draft...' : 'Generate Draft'}
                </Button>
            </div>
        </div>
    );
}
