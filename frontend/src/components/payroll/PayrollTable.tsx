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
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Assuming standard HTML table since I can't verify individual shadcn Table export structure fully without read, but keeping it safe with standard tags + classes or importing if I was sure. 
          The import above suggests I assume they exist. I will use standard elements with shared component logic if needed, but for now let's write standard generic table structure matching the style of the project.
      */}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gross Pay</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Taxes</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Deductions</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Net Pay</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((employee) => (
                        <tr key={employee.id} className={employee.hasByAnomaly ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{employee.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{employee.role}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${employee.grossPay.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${employee.taxes.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${employee.deductions.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">${employee.netPay.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {employee.hasByAnomaly ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100" title={employee.anomalyMessage}>
                                        Anomaly
                                    </span>
                                ) : employee.status === 'Corrected' ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                                        Corrected
                                    </span>
                                ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                        Ready
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button variant="secondary" size="sm" onClick={() => onCorrect(employee)}>
                                    Correct
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
