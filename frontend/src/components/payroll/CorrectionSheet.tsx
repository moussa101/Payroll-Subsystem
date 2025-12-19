"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/FormInput';
import { Modal } from '@/components/ui/Modal';
import React from 'react';

// Correction Interface
export interface CorrectionData {
    employeeId: string;
    employeeName: string;
    grossPay: number;
    taxes: number;
    deductions: number;
    netPay: number;
}

interface CorrectionSheetProps {
    employee: CorrectionData | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CorrectionData) => void;
}

export const CorrectionSheet: React.FC<CorrectionSheetProps> = ({ employee, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = React.useState<CorrectionData | null>(null);
    // Local state for inputs to handle decimals correctly
    const [inputValues, setInputValues] = React.useState<{
        grossPay: string;
        taxes: string;
        deductions: string;
    }>({ grossPay: '', taxes: '', deductions: '' });

    React.useEffect(() => {
        if (employee) {
            setFormData({ ...employee });
            setInputValues({
                grossPay: employee.grossPay.toString(),
                taxes: employee.taxes.toString(),
                deductions: employee.deductions.toString()
            });
        }
    }, [employee]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        
        // Update input string value
        setInputValues(prev => ({ ...prev, [name]: value }));

        // Update numeric value for calculation if valid number
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            setFormData(prev => prev ? ({ ...prev, [name]: numValue }) : null);
        } else if (value === '') {
             setFormData(prev => prev ? ({ ...prev, [name]: 0 }) : null);
        }
    };

    // Auto-calculate Net Pay
    React.useEffect(() => {
        if (formData) {
            const net = formData.grossPay - formData.taxes - formData.deductions;
            // Only update if netPay actually changes to avoid loops, though dependency array handles it
            if (net !== formData.netPay) {
                setFormData(prev => prev ? ({ ...prev, netPay: net }) : null);
            }
        }
    }, [formData?.grossPay, formData?.taxes, formData?.deductions]);

    const handleSubmit = () => {
        if (formData) {
            onSave(formData);
        }
    };

    if (!employee || !formData || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Correct Payroll</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="grossPay" className="block text-sm font-medium text-gray-700 mb-1">Gross Pay</label>
                        <input
                            id="grossPay"
                            type="number"
                            name="grossPay"
                            value={inputValues.grossPay}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="taxes" className="block text-sm font-medium text-gray-700 mb-1">Taxes</label>
                            <input
                                id="taxes"
                                type="number"
                                name="taxes"
                                value={inputValues.taxes}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="deductions" className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
                            <input
                                id="deductions"
                                type="number"
                                name="deductions"
                                value={inputValues.deductions}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-500">Net Pay (Calculated)</label>
                        <p className="text-2xl font-bold text-gray-900">${formData.netPay.toFixed(2)}</p>
                    </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="default" onClick={handleSubmit}>Save Corrections</Button>
                    <div className="flex justify-end gap-3 mt-6">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#0B1120] rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                        >
                            Save Corrections
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
