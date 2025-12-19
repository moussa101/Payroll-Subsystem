import React from 'react';

import { Button } from '@/components/ui/button';

export interface EmployeePayroll {
    id: string;
    name: string;
    role: string;
    grossPay: number;
    taxes: number;
    deductions: number;
    netPay: number;
    hasByAnomaly: boolean;
    anomalyMessage?: string;
    status: 'Ready' | 'Flagged' | 'Corrected';
}

interface PayrollTableProps {
    data: EmployeePayroll[];
    onCorrect: (employee: EmployeePayroll) => void;
}

export const PayrollTable: React.FC<PayrollTableProps> = ({ data, onCorrect }) => {
    return (
        <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxes</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                        {employee.name.charAt(0)}
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                        <div className="text-sm text-gray-500">{employee.role}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${employee.grossPay.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${employee.taxes.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${employee.deductions.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${employee.netPay.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {employee.hasByAnomaly ? (
                                    <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-red-50 text-red-700">
                                        Anomaly
                                    </span>
                                ) : employee.status === 'Corrected' ? (
                                    <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-yellow-50 text-yellow-700">
                                        Corrected
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-green-50 text-green-700">
                                        Ready
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                    onClick={() => onCorrect(employee)}
                                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                                >
                                    Correct
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
