'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { PayrollRun, PayrollCycleStatus } from '../types/payroll-execution';

interface PayrollContextType {
    currentRun: PayrollRun | null;
    status: PayrollCycleStatus | 'N/A';
    loading: boolean;
    error: string | null;
    refreshData: () => Promise<void>;
}

const PayrollContext = createContext<PayrollContextType | undefined>(undefined);

export const PayrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentRun, setCurrentRun] = useState<PayrollRun | null>(null);
    const [status, setStatus] = useState<PayrollCycleStatus | 'N/A'>('N/A');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const refreshData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Default to localhost if env var is not set
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

            // Using the endpoint for current status
            const response = await axios.get(`${baseUrl}/payroll-execution/current-status`, { headers });

            setCurrentRun(response.data);
            setStatus(response.data.status);
        } catch (err: any) {
            console.error('Failed to fetch payroll status:', err);
            // If 404 or similar, it might mean no active run, so status is N/A
            setStatus('N/A');
            setCurrentRun(null);
            // Only set error if it's a real error, not just "no active run"
            if (err.response?.status !== 404) {
                setError('Failed to load payroll data');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    return (
        <PayrollContext.Provider value={{ currentRun, status, loading, error, refreshData }}>
            {children}
        </PayrollContext.Provider>
    );
};

export const usePayroll = () => {
    const context = useContext(PayrollContext);
    if (context === undefined) {
        throw new Error('usePayroll must be used within a PayrollProvider');
    }
    return context;
};
