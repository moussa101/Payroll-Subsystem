import React from 'react';

interface StatusCardProps {
    status: 'Draft' | 'Review' | 'Approved' | 'Paid' | 'Rejected';
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
                    ${status === 'Draft' ? 'bg-gray-100 text-gray-800' : ''}
                    ${status === 'Review' ? 'bg-blue-50 text-blue-700' : ''}
                    ${status === 'Approved' ? 'bg-green-50 text-green-700' : ''}
                    ${status === 'Paid' ? 'bg-purple-50 text-purple-700' : ''}
                    ${status === 'Rejected' ? 'bg-red-50 text-red-700' : ''}
                `}>
                    {status}
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
