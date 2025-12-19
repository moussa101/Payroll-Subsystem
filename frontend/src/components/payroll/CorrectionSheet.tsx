"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/FormInput';
import { Modal } from '@/components/ui/Modal';

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

    React.useEffect(() => {
        if (employee) {
            setFormData({ ...employee });
        }
    }, [employee]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [name]: parseFloat(value) || 0 }) : null);
    };

    // Auto-calculate Net Pay
    React.useEffect(() => {
        if (formData) {
            const net = formData.grossPay - formData.taxes - formData.deductions;
            setFormData(prev => prev ? ({ ...prev, netPay: net }) : null);
        }
    }, [formData?.grossPay, formData?.taxes, formData?.deductions]);

    const handleSubmit = () => {
        if (formData) {
            onSave(formData);
        }
    };

    if (!employee || !formData) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Correct Payroll for ${employee.employeeName}`}
        >
            <div className="space-y-4">
                <FormInput
                    label="Gross Pay"
                    type="number"
                    name="grossPay"
                    value={formData.grossPay}
                    onChange={handleChange}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label="Taxes"
                        type="number"
                        name="taxes"
                        value={formData.taxes}
                        onChange={handleChange}
                    />
                    <FormInput
                        label="Deductions"
                        type="number"
                        name="deductions"
                        value={formData.deductions}
                        onChange={handleChange}
                    />
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Net Pay (Calculated)</label>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">${formData.netPay.toFixed(2)}</p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="default" onClick={handleSubmit}>Save Corrections</Button>
                </div>
            </div>
        </Modal>
    );
};
