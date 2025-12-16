// src/types/payroll-execution.ts

export type PayrollStatus = 
  | 'DRAFT' 
  | 'REVIEWING_BY_MANAGER' 
  | 'WAITING_FINANCE_APPROVAL' 
  | 'PAID' 
  | 'REJECTED';

export type UserRole = 'PAYROLL_MANAGER' | 'FINANCE_STAFF';

export interface AuditLogEntry {
  action: string;
  user: string;
  timestamp: string;
  reason?: string;
}

export interface PayrollSummary {
  totalGross: number;
  totalTaxes: number;
  totalNetPayable: number;
  employeeCount: number;
}

export interface PayrollAnomaly {
  employeeId: string;
  name: string;
  issue: string;
}

export interface PayrollCycle {
  id: string;
  period: string;
  status: PayrollStatus;
  summary: PayrollSummary;
  anomalies: PayrollAnomaly[];
  auditLog: AuditLogEntry[];
}