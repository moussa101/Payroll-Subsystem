"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PreRunCheckList } from '@/components/payroll/PreRunCheckList';

import { hasAnyRole, getToken } from '@/lib/auth';

// ... (existing imports)

export default function InitiationPage() {
    const router = useRouter();
    const [period, setPeriod] = useState('2025-12');
    const [checks, setChecks] = useState<{ id: string; description: string; resolved: boolean }[]>([]);
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
    const [loadingChecks, setLoadingChecks] = useState(true);

    useEffect(() => {
        const fetchChecks = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
                
                // Replace with actual endpoint
                const response = await axios.get(`${baseUrl}/payroll-execution/pre-run-checks`, { headers });
                setChecks(response.data);
            } catch (error) {
                console.error('Failed to fetch pre-run checks:', error);
                // Fallback to empty or show error
                setChecks([]); 
            } finally {
                setLoadingChecks(false);
            }
        };

        fetchChecks();
    }, []);

    const handleToggleCheck = (id: string, resolved: boolean) => {
        setChecks(checks.map(c => c.id === id ? { ...c, resolved } : c));
    };

    const allChecksResolved = checks.length > 0 && checks.every(c => c.resolved);

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
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <Link href="/payroll-execution" className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 inline-flex items-center transition-colors">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Initiate Payroll Run</h1>
                <p className="text-gray-500 mt-1">Select period and verify pre-run conditions.</p>
            </div>

            <div className="bg-white shadow-sm rounded-xl p-6 mb-8 border border-gray-200">
                <h2 className="text-lg font-semibold mb-6 text-gray-900">Run Details</h2>
                <div className="mb-8">
                    <label htmlFor="period-select" className="block text-sm font-medium text-gray-700 mb-2">Payroll Period</label>
                    <input
                        type="month"
                        id="period-select"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border transition-colors"
                    />
                </div>

                <PreRunCheckList checks={checks} onToggleCheck={handleToggleCheck} />
                {loadingChecks && <p className="text-sm text-gray-500 mt-2">Loading checks...</p>}
                {!loadingChecks && checks.length === 0 && <p className="text-sm text-gray-500 mt-2">No pre-run checks required.</p>}
            </div>

            <div className="flex justify-end">
                <button
                    variant="default"
                    size="lg"
                    onClick={handleGenerateDraft}
                    disabled={!allChecksResolved || isGenerating}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-all
                        ${!allChecksResolved || isGenerating 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-[#0B1120] hover:bg-gray-800 hover:shadow-md'
                        }`}
                >
                    {isGenerating ? 'Generating Draft...' : 'Generate Draft'}
                </button>
            </div>
        </div>
    );
}
