export enum PayrollCycleStatus {
  DRAFT = 'DRAFT',
  REVIEWING_BY_MANAGER = 'REVIEWING_BY_MANAGER',
  UNDER_REVIEW = 'UNDER_REVIEW',
  WAITING_FINANCE_APPROVAL = 'WAITING_FINANCE_APPROVAL',
  PAID = 'PAID',
  REJECTED = 'REJECTED'
}

export interface EmployeeDraftEntry {
  id: string; // Maps to _id
  employeeId: string;
  name: string; // This might need to be fetched separately if not in ReadPayslipDTO, but assuming it's available or mapped
  basicSalary: number; // Maps to earningsDetails.baseSalary
  allowances: number; // Sum of allowances
  deductions: number; // Sum of deductions
  netSalary: number; // Maps to netPay
  status: string; // Maps to paymentStatus
}

export interface PayrollActionPayload {
  approved: boolean;
  reason?: string;
}

export interface InitiatePayrollPayload {
  period: string; // YYYY-MM
}

export interface EarningsDto {
  baseSalary: number;
  allowances?: { name: string; amount: number }[];
  bonuses?: { name: string; amount: number }[];
  benefits?: { name: string; amount: number }[];
  refunds?: { description: string; amount: number }[];
}

export interface DeductionsDto {
  taxes: { name: string; rate: number }[];
  insurances?: { name: string; employeeRate: number; employerRate: number }[];
  penalties?: { reason: string; amount: number }[];
}

export interface CorrectionPayload {
  earningsDetails?: EarningsDto;
  deductionsDetails?: DeductionsDto;
  totalGrossSalary?: number;
  totalDeductions?: number;
  netPay?: number;
  paymentStatus?: string;
}

export interface PayrollRun {
  id: string;
  period: string;
  status: PayrollCycleStatus;
  totalGross: number;
  totalNet: number;
  employeeEntries: EmployeeDraftEntry[];
}

export interface AuditLogEntry {
  timestamp: string;
  user: string;
  action: string;
  reason?: string;
}

export type UserRole = 'PAYROLL_MANAGER' | 'FINANCE_STAFF' | 'HR_ADMIN';

export interface PayrollAnomaly {
  employeeId: string;
  name: string;
  issue: string;
}

export interface PayrollCycle {
  id: string;
  period: string;
  status: PayrollCycleStatus | string;
  summary: {
    totalGross: number;
    totalTaxes: number;
    totalNetPayable: number;
    employeeCount: number;
  };
  anomalies: PayrollAnomaly[];
  auditLog: AuditLogEntry[];
}