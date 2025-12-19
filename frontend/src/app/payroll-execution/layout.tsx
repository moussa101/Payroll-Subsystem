import React from 'react';
import Link from 'next/link';
import { PayrollProvider } from '@/context/PayrollContext';

export default function PayrollExecutionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PayrollProvider>
            <div className="flex min-h-screen bg-gray-50">
                {/* Sidebar */}
                <aside className="w-64 bg-[#0B1120] text-white flex-shrink-0 flex flex-col">
                    <div className="p-6 flex-1">
                        <div className="mb-8">
                            <h2 className="text-xs font-semibold text-emerald-400 tracking-wider uppercase mb-4">
                                Navigation
                            </h2>
                            <nav className="space-y-1">
                                <Link href="/payroll-execution" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md">
                                    <span>Dashboard</span>
                                </Link>
                                <Link href="/payroll-execution/initiate" className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md">
                                    <span>Initiate Run</span>
                                </Link>
                                <Link href="/payroll-execution/review/current" className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md">
                                    <span>Review Run</span>
                                </Link>
                                <div className="pt-4 pb-2">
                                    <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">History</p>
                                </div>
                                <Link href="/payroll-execution" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md">
                                    <span>Payroll History</span>
                                </Link>
                            </nav>
                        </div>
                    </div>
                    
                    {/* User Profile at bottom */}
                    <div className="p-4 border-t border-gray-800">
                         <div className="flex items-center cursor-pointer hover:bg-gray-800 p-2 rounded-md transition-colors">
                            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium text-white">
                                N
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">User</p>
                                <p className="text-xs text-gray-400">View Profile</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </PayrollProvider>
    );
}
