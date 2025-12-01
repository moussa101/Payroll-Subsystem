import { Types } from 'mongoose';
import { allowance } from '../../payroll-configuration/models/allowance.schema';
import { taxRules } from '../../payroll-configuration/models/taxRules.schema';
import { insuranceBrackets } from '../../payroll-configuration/models/insuranceBrackets.schema';
import { employeePenalties } from '../models/employeePenalties.schema';
import { terminationAndResignationBenefits } from '../../payroll-configuration/models/terminationAndResignationBenefits';

export class PayslipResultDto {
  employeeId: Types.ObjectId;
  totalGrossSalary: number;
  totalDeductions: number;
  netPay: number;

  earningsDetails: {
    baseSalary: number;
    allowances?: allowance[];
    bonuses?: { name: string; givenAmount: number }[];
    benefits?: terminationAndResignationBenefits[];
  };

  deductionsDetails: {
    taxes?: taxRules[];
    insurances?: insuranceBrackets[];
    penalties?: employeePenalties[];
  };
}
