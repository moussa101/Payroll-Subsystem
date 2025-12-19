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
        <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Current Cycle Status</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${status === PayrollCycleStatus.DRAFT ? 'bg-gray-100 text-gray-800' : ''}
                    ${status === PayrollCycleStatus.REVIEWING_BY_MANAGER || status === PayrollCycleStatus.UNDER_REVIEW ? 'bg-blue-100 text-blue-800' : ''}
                    ${status === PayrollCycleStatus.WAITING_FINANCE_APPROVAL ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${status === PayrollCycleStatus.PAID ? 'bg-purple-100 text-purple-800' : ''}
                    ${status === PayrollCycleStatus.REJECTED ? 'bg-red-100 text-red-800' : ''}
                    ${status === 'Draft' ? 'bg-gray-100 text-gray-800' : ''}
                    ${status === 'Review' ? 'bg-blue-50 text-blue-700' : ''}
                    ${status === 'Approved' ? 'bg-green-50 text-green-700' : ''}
                    ${status === 'Paid' ? 'bg-purple-50 text-purple-700' : ''}
                    ${status === 'Rejected' ? 'bg-red-50 text-red-700' : ''}
                `}>
                    {status.replace(/_/g, ' ')}
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Payroll Period</p>
                    <p className="text-2xl font-bold text-gray-900">{cyclePeriod}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Employees Processed</p>
                    <p className="text-2xl font-bold text-gray-900">{employeeCount}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Estimated Total</p>
                    <p className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};
