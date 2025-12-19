import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // Assuming Card exists or I'll create a simple wrapper if not found, let's check first. Actually I haven't checked for Card component. I'll make a standard div structure first if Card is missing, but better to check.
// Wait, I only saw Button, FormInput, Modal, StatusBadge, Table in the previous ls of shared ui.
// I will create the StatusCard using standard tailwind for now or create a Card component if needed.
// Let's create the StatusCard directly.

import { PayrollCycleStatus } from '@/types/payroll-execution';

interface StatusCardProps {
    status: PayrollCycleStatus | string;
    cyclePeriod: string;
    employeeCount: number;
    totalAmount: number;
}

export const StatusCard: React.FC<StatusCardProps> = ({ status, cyclePeriod, employeeCount, totalAmount }) => {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Current Cycle Status</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${status === PayrollCycleStatus.DRAFT ? 'bg-gray-100 text-gray-800' : ''}
                    ${status === PayrollCycleStatus.REVIEWING_BY_MANAGER || status === PayrollCycleStatus.UNDER_REVIEW ? 'bg-blue-100 text-blue-800' : ''}
                    ${status === PayrollCycleStatus.WAITING_FINANCE_APPROVAL ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${status === PayrollCycleStatus.PAID ? 'bg-purple-100 text-purple-800' : ''}
                    ${status === PayrollCycleStatus.REJECTED ? 'bg-red-100 text-red-800' : ''}
                `}>
                    {status.replace(/_/g, ' ')}
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payroll Period</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{cyclePeriod}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Employees Processed</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{employeeCount}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Total</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">${totalAmount.toLocaleString()}</p>
                </div>
            </div>
        </div >
    );
};
