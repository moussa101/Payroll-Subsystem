import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { paySlip, PayslipDocument } from './models/payslip.schema';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';
import { allowance } from '../payroll-configuration/models/allowance.schema';
import { taxRules } from '../payroll-configuration/models/taxRules.schema';
import { insuranceBrackets } from '../payroll-configuration/models/insuranceBrackets.schema';
import { employeePenalties } from './models/employeePenalties.schema';

@Injectable()
export class PayrollCalculationService {
  constructor(
    @InjectModel(paySlip.name) private payslipModel: Model<PayslipDocument>,
  ) {}

  async generateDraftPayroll(employees: EmployeeProfile[]) {
    const draftPayslips: paySlip[] = [];

    for (const emp of employees) {
      // -------------------
      // Mock data (override from mockEmployees.ts)
      const allowances: allowance[] = emp['mockAllowances'] || [];
      const taxes: taxRules[] = emp['mockTaxes'] || [];
      const insurances: insuranceBrackets[] = emp['mockInsurances'] || [];
      const penalties: number = emp['mockPenalties'] || 0;
      const benefits: number = emp['mockBenefits'] || 0;
      const baseSalary: number = emp['baseSalary'] || 0;

      // -------------------
      // Earnings
      const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
      const totalGross = baseSalary + totalAllowances + benefits;

      // -------------------
      // Deductions
      const totalTaxes = this.calculateTax(totalGross, taxes);
      const totalInsurance = this.calculateInsurance(totalGross, insurances);
      const totalDeductions = totalTaxes + totalInsurance + penalties;

      // -------------------
      // Net pay
      const netPay = totalGross - totalDeductions;

      // -------------------
      // Anomaly detection
      const anomalies: string[] = [];

      // ❗ FIX: use mockBankAccountNumber instead of bankAccountNumber
      if (!emp['mockBankAccountNumber']) {
        anomalies.push('Missing bank account');
      }

      if (netPay < 0) anomalies.push('Negative net pay');

      // -------------------
      // FIX: employee _id may be stored under emp['mockId'] in mock data
      const employeeId =
        emp['_id'] || emp['id'] || emp['mockId'] || new Types.ObjectId();

      // -------------------
      // Save draft payslip
      const draft = new this.payslipModel({
        employeeId: employeeId,
        payrollRunId: new Types.ObjectId(),
        earningsDetails: {
          baseSalary,
          allowances,
          bonuses: [],
          benefits: [],
          refunds: [],
        },
        deductionsDetails: {
          taxes,
          insurances,
          penalties: {
            employeeId: employeeId,
            penalties: [] as employeePenalties[],
          },
        },
        totalGrossSalary: totalGross,
        totaDeductions: totalDeductions,
        netPay,
        paymentStatus: 'PENDING',
        anomalies,
      });

      await draft.save();
      draftPayslips.push(draft);
    }

    return draftPayslips;
  }

  // -------------------
  // Tax calculation
  private calculateTax(gross: number, taxRules: taxRules[]): number {
    let tax = 0;
    for (const t of taxRules) {
      tax += gross * (t.rate / 100);
    }
    return tax;
  }

  // -------------------
  // Insurance calculation
  private calculateInsurance(
    gross: number,
    insurances: insuranceBrackets[],
  ): number {
    return insurances.reduce(
      (sum, i) => sum + gross * (i.employeeRate / 100),
      0,
    );
  }
}
