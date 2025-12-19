"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PreRunCheckList } from '@/components/payroll-execution/PreRunCheckList';
import { hasAnyRole, getToken } from '@/lib/auth';

export default function InitiationPage() {
    const router = useRouter();

    const [period, setPeriod] = useState('2025-12');
    const [checks, setChecks] = useState<{ id: string; description: string; resolved: boolean }[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingChecks, setLoadingChecks] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // 🔐 Authorization check
    useEffect(() => {
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

    // ⛔ Block rendering until auth is resolved
    if (!isAuthorized) return null;

    // 📋 Fetch pre-run checks
    useEffect(() => {
        const fetchChecks = async () => {
            try {
                const token = getToken();
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const baseUrl =
                    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

                const response = await axios.get(
                    `${baseUrl}/payroll-execution/pre-run-checks`,
                    { headers }
                );

                setChecks(response.data);
            } catch (error) {
                console.error('Failed to fetch pre-run checks:', error);
                setChecks([]);
            } finally {
                setLoadingChecks(false);
            }
        };

        fetchChecks();
    }, []);

    const handleToggleCheck = (id: string, resolved: boolean) => {
        setChecks(prev =>
            prev.map(c => (c.id === id ? { ...c, resolved } : c))
        );
    };

    const allChecksResolved =
        checks.length > 0 && checks.every(c => c.resolved);

    const handleGenerateDraft = async () => {
        setIsGenerating(true);
        try {
            const token = getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const baseUrl =
                process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

            await axios.post(
                `${baseUrl}/payroll-execution/initiate`,
                { period },
                { headers }
            );

            router.push('/payroll-execution/review/current');
        } catch (error) {
            console.error('Failed to initiate payroll:', error);
            alert('Failed to initiate payroll run. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/payroll-execution"
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 inline-flex items-center"
                >
                    ← Back to Dashboard
                </Link>

                <h1 className="text-2xl font-bold text-gray-900 mt-2">
                    Initiate Payroll Run
                </h1>
                <p className="text-gray-500 mt-1">
                    Select period and verify pre-run conditions.
                </p>
            </div>

            <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200">
                <h2 className="text-lg font-semibold mb-6 text-gray-900">
                    Run Details
                </h2>

                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payroll Period
                    </label>
                    <input
                        type="month"
                        value={period}
                        onChange={e => setPeriod(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2.5"
                    />
                </div>

                <PreRunCheckList
                    checks={checks}
                    onToggleCheck={handleToggleCheck}
                />

                {loadingChecks && (
                    <p className="text-sm text-gray-500 mt-2">
                        Loading checks…
                    </p>
                )}

                {!loadingChecks && checks.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                        No pre-run checks required.
                    </p>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleGenerateDraft}
                    disabled={!allChecksResolved || isGenerating}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white
                        ${!allChecksResolved || isGenerating
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-[#0B1120] hover:bg-gray-800'
                        }`}
                >
                    {isGenerating ? 'Generating Draft…' : 'Generate Draft'}
                </button>
            </div>
        </div>
    );
}
