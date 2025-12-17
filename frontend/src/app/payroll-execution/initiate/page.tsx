"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { PreRunCheckList } from '@/components/payroll/PreRunCheckList';
import { FormInput } from '@/components/ui/FormInput'; // Reusing FormInput for date/select if possible, otherwise standard select

const MOCK_CHECKS = [
    { id: '1', description: 'Pending termination benefits verified', resolved: false },
    { id: '2', description: 'New hire documents signed', resolved: false },
    { id: '3', description: 'Bonus approvals completed', resolved: true },
];

export default function InitiationPage() {
    const router = useRouter();
    const [period, setPeriod] = useState('2025-12');
    const [checks, setChecks] = useState(MOCK_CHECKS);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleToggleCheck = (id: string, resolved: boolean) => {
        setChecks(checks.map(c => c.id === id ? { ...c, resolved } : c));
    };

    const allChecksResolved = checks.every(c => c.resolved);

    const handleGenerateDraft = async () => {
        setIsGenerating(true);
        // Simulate API call
        setTimeout(() => {
            setIsGenerating(false);
            // Navigate to review page with a mock cycle ID
            router.push('/payroll-execution/review/cycle-123');
        }, 1500);
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
                    variant="primary"
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
