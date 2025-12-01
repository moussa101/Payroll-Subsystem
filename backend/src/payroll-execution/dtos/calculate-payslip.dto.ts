// import { IsNotEmpty, IsArray, IsOptional } from 'class-validator';
// import { Types } from 'mongoose';
// import { allowance } from '../../payroll-configuration/models/allowance.schema';
// import { taxRules } from '../../payroll-configuration/models/taxRules.schema';
// import { insuranceBrackets } from '../../payroll-configuration/models/insuranceBrackets.schema';
// import { employeePenalties } from '../models/employeePenalties.schema';
// import { terminationAndResignationBenefits } from '../../payroll-configuration/models/terminationAndResignationBenefits';

// export class CalculatePayslipDto {
//   @IsNotEmpty()
//   employeeId: Types.ObjectId;

//   @IsNotEmpty()
//   baseSalary: number;

//   @IsArray()
//   @IsOptional()
//   allowances?: allowance[];

//   @IsArray()
//   @IsOptional()
//   bonuses?: { name: string; givenAmount: number }[];

//   @IsArray()
//   @IsOptional()
//   benefits?: terminationAndResignationBenefits[];

//   @IsArray()
//   @IsOptional()
//   taxes?: taxRules[];

//   @IsArray()
//   @IsOptional()
//   insurances?: insuranceBrackets[];

//   @IsArray()
//   @IsOptional()
//   penalties?: employeePenalties[];
// }
