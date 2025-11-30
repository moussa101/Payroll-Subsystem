import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

// --- Auth Integration ---
import { AuthUser } from '../auth/authorization/interfaces/auth-user.interface';
import { UserRole } from '../auth/authorization/constants/roles.constant';

// --- Schemas ---
import { allowance } from './models/allowance.schema';
import { taxRules } from './models/taxRules.schema';
import { insuranceBrackets } from './models/insuranceBrackets.schema';
import { signingBonus } from './models/signingBonus.schema';
import { CompanyWideSettings } from './models/CompanyWideSettings.schema';
import { payGrade } from './models/payGrades.schema';
import { payType } from './models/payType.schema';
import { payrollPolicies } from './models/payrollPolicies.schema';
import { terminationAndResignationBenefits } from './models/terminationAndResignationBenefits';

// --- DTOs (FIXED IMPORTS - Mapping Create and Update DTOs to their individual files) ---
import { CreateAllowanceDto } from './dto/create-allowance.dto';
import { UpdateAllowanceDto } from './dto/update-allowance.dto';

import { CreateTaxRuleDto } from './dto/create-tax-rule.dto';
import { UpdateTaxRuleDto } from './dto/update-tax-rule.dto';

import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';

import { CreateSigningBonusDto } from './dto/create-signing-bonus.dto';
import { UpdateSigningBonusDto } from './dto/update-signing-bonus.dto';

import { CreateCompanySettingsDto } from './dto/create-company-settings.dto';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

import { CreatePayGradeDto } from './dto/create-pay-grade.dto';
import { UpdatePayGradeDto } from './dto/update-pay-grade.dto';

import { CreatePayTypeDto } from './dto/create-pay-type.dto';
import { UpdatePayTypeDto } from './dto/update-pay-type.dto';

import { CreatePayrollPoliciesDto } from './dto/create-payroll-policies.dto';
import { UpdatePayrollPoliciesDto } from './dto/update-payroll-policies.dto';

import { CreateTerminationBenefitsDto } from './dto/create-termination-benefits.dto';
import { UpdateTerminationBenefitsDto } from './dto/update-termination-benefits.dto';

import { ChangeStatusDto } from './dto/change-status.dto';
import { ConfigStatus } from './enums/payroll-configuration-enums';

// --- Integration ---
import { OrganizationStructureService } from '../organization-structure/organization-structure.service';
import { EmployeeProfileService } from '../employee-profile/employee-profile.service';

@Injectable()
export class PayrollConfigurationService {
  constructor(
    // Models
    @InjectModel(allowance.name) private allowanceModel: Model<allowance>,
    @InjectModel(taxRules.name) private taxRulesModel: Model<taxRules>,
    @InjectModel(insuranceBrackets.name) private insuranceModel: Model<insuranceBrackets>,
    @InjectModel(signingBonus.name) private bonusModel: Model<signingBonus>,
    @InjectModel(CompanyWideSettings.name) private settingsModel: Model<CompanyWideSettings>,
    @InjectModel(payGrade.name) private payGradeModel: Model<payGrade>,
    @InjectModel(payType.name) private payTypeModel: Model<payType>,
    @InjectModel(payrollPolicies.name) private payrollPoliciesModel: Model<payrollPolicies>,
    @InjectModel(terminationAndResignationBenefits.name) private termModel: Model<terminationAndResignationBenefits>,

    // Integration
    private readonly orgService: OrganizationStructureService,
    private readonly empService: EmployeeProfileService,
  ) {}

  // ===========================================================================
  // GENERAL HELPERS
  // ===========================================================================

  private async approveGeneric(model: Model<any>, id: string, dto: ChangeStatusDto, user: AuthUser) {
    const record = await model.findById(id);
    if (!record) throw new NotFoundException('Record not found');

    if (record.status === ConfigStatus.APPROVED && dto.status === ConfigStatus.APPROVED) {
      throw new BadRequestException('Record is already Approved');
    }

    // Role Check: Only Managers/Admins can Approve
    if (dto.status === ConfigStatus.APPROVED) {
      const allowedRoles = [UserRole.PAYROLL_MANAGER, UserRole.HR_MANAGER, UserRole.SYSTEM_ADMIN];
      if (!allowedRoles.includes(user.role)) {
        throw new ForbiddenException('Only Managers can approve configurations');
      }

      record.approvedBy = new Types.ObjectId(user.userId);
      record.approvedAt = new Date();
    }

    record.status = dto.status;
    return record.save();
  }

  // Helper to ensure item is in Draft before editing (REQ-PY-1 BR)
  private async checkDraftStatus(model: Model<any>, id: string): Promise<any> {
    const record = await model.findById(id);
    if (!record) throw new NotFoundException('Record not found');
    if (record.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(`Configuration status must be DRAFT to be updated. Current status: ${record.status}`);
    }
    return record;
  }

  // ===========================================================================
  // 1. Company Wide Settings (Singleton Logic)
  // ===========================================================================

  async createSettings(dto: CreateCompanySettingsDto): Promise<CompanyWideSettings> {
    const existing = await this.settingsModel.findOne().exec();
    if (existing) {
      throw new BadRequestException("Company settings already exist. Use PUT/update endpoint instead.");
    }
    return new this.settingsModel(dto).save();
  }

  async updateSettings(dto: UpdateCompanySettingsDto): Promise<CompanyWideSettings> {
    // Singleton Logic: Find the one existing document, update it, or create if none exists.
    const existing = await this.settingsModel.findOne();
    if (existing) {
      Object.assign(existing, dto);
      return existing.save();
    }
    // If it doesn't exist, use the Update DTO values to create the first one.
    return new this.settingsModel(dto).save();
  }

  async getSettings() {
    return this.settingsModel.findOne().exec();
  }

  // ===========================================================================
  // 2. Pay Grades (REQ-PY-2)
  // ===========================================================================

  async createPayGrade(dto: CreatePayGradeDto, user: AuthUser): Promise<payGrade> {
    if (dto.grossSalary < dto.baseSalary) {
      throw new BadRequestException('Gross Salary cannot be less than Base Salary');
    }
    return new this.payGradeModel({ ...dto, status: ConfigStatus.DRAFT, createdBy: new Types.ObjectId(user.userId) }).save();
  }

  async updatePayGrade(id: string, dto: UpdatePayGradeDto, user: AuthUser): Promise<payGrade> {
    const record = await this.checkDraftStatus(this.payGradeModel, id);
    if (dto.grossSalary && dto.baseSalary && dto.grossSalary < record.baseSalary) {
      throw new BadRequestException('Gross Salary cannot be less than Base Salary');
    }
    Object.assign(record, dto);
    record.createdBy = new Types.ObjectId(user.userId);
    return record.save();
  }

  async getPayGrades() { return this.payGradeModel.find().exec(); }

  async changePayGradeStatus(id: string, dto: ChangeStatusDto, user: AuthUser) {
    return this.approveGeneric(this.payGradeModel, id, dto, user);
  }

  // ===========================================================================
  // 3. Payroll Policies (REQ-PY-1)
  // ===========================================================================

  async createPayrollPolicy(dto: CreatePayrollPoliciesDto, user: AuthUser): Promise<payrollPolicies> {
    return new this.payrollPoliciesModel({ ...dto, status: ConfigStatus.DRAFT, createdBy: new Types.ObjectId(user.userId) }).save();
  }

  async updatePayrollPolicy(id: string, dto: UpdatePayrollPoliciesDto, user: AuthUser): Promise<payrollPolicies> {
    const record = await this.checkDraftStatus(this.payrollPoliciesModel, id);
    Object.assign(record, dto);
    record.createdBy = new Types.ObjectId(user.userId);
    return record.save();
  }

  async changePayrollPolicyStatus(id: string, dto: ChangeStatusDto, user: AuthUser) {
    return this.approveGeneric(this.payrollPoliciesModel, id, dto, user);
  }

  // ===========================================================================
  // 4. Tax Rules (REQ-PY-10)
  // ===========================================================================

  async createTaxRule(dto: CreateTaxRuleDto, user: AuthUser): Promise<taxRules> {
    return new this.taxRulesModel({ ...dto, status: ConfigStatus.DRAFT, createdBy: new Types.ObjectId(user.userId) }).save();
  }

  async updateTaxRule(id: string, dto: UpdateTaxRuleDto, user: AuthUser): Promise<taxRules> {
    const record = await this.checkDraftStatus(this.taxRulesModel, id);
    Object.assign(record, dto);
    record.createdBy = new Types.ObjectId(user.userId);
    return record.save();
  }

  async approveTaxRule(id: string, dto: ChangeStatusDto, user: AuthUser) {
    return this.approveGeneric(this.taxRulesModel, id, dto, user);
  }

  async getTaxRules() { return this.taxRulesModel.find().exec(); }

  // =========================================================================== To be CONTINUED

  async approveTerminationBenefit(id: string, dto: ChangeStatusDto, user: AuthUser) {
    return this.approveGeneric(this.termModel, id, dto, user);
  }
}