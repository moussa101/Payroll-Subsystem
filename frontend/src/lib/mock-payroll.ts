// src/lib/mock-payroll.ts
import { PayrollCycle } from '@/types/payroll-execution';

export const MOCK_CYCLE: PayrollCycle = {
  id: 'cycle-nov-2025',
  period: 'November 2025',
  status: 'REVIEWING_BY_MANAGER', // We start here as this is Member 2's entry point [cite: 267]
  summary: {
    totalGross: 500000,
    totalTaxes: 50000,
    totalNetPayable: 450000,
    employeeCount: 150,
  },
  anomalies: [
    { employeeId: 'E001', name: 'John Doe', issue: 'Negative Net Pay (-$200)' },
    { employeeId: 'E042', name: 'Sarah Smith', issue: 'Missing Bank Account' },
  ],
  auditLog: [
    { action: 'INITIATED', user: 'Specialist A', timestamp: '2025-11-20 09:00' },
    { action: 'SUBMITTED_FOR_REVIEW', user: 'Specialist A', timestamp: '2025-11-21 14:00' },
  ],
};