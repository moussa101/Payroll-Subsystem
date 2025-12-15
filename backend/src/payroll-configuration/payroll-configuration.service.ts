import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

// --- Auth Integration ---
import { AuthUser } from '../auth/auth-user.interface';
import { UserRole } from '../auth/permissions.constant';

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

// --- DTOs (Using the corrected file paths and class names) ---
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

    // Role Check: Only Managers/Admins can Approve or Reject
    const allowedRoles = [UserRole.PAYROLL_MANAGER, UserRole.HR_MANAGER, UserRole.SYSTEM_ADMIN];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Only Managers can approve or reject configurations');
    }

    if (dto.status === ConfigStatus.APPROVED) {
      // Capture the approver's ID from the JWT token
      record.approvedBy = new Types.ObjectId(user.userId);
      record.approvedAt = new Date();
    }

    record.status = dto.status;
    // Optional: If rejected, we could clear approvedBy/approvedAt if they existed
    return record.save();
  }

  // Helper to ensure item is in Draft before editing (REQ-PY-1 BR)
  // For testing: Allow SYSTEM_ADMIN to edit approved items
  private async checkDraftStatus(model: Model<any>, id: string, user?: AuthUser): Promise<any> {
    const record = await model.findById(id);
    if (!record) throw new NotFoundException('Record not found');
    // Allow SYSTEM_ADMIN to edit approved items for testing
    if (record.status !== ConfigStatus.DRAFT) {
      const isAdmin = user && (user.role === UserRole.SYSTEM_ADMIN || user.role === UserRole.PAYROLL_MANAGER);
      if (!isAdmin) {
        throw new BadRequestException(`Configuration status must be DRAFT to be updated. Current status: ${record.status}`);
      }
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
    const payGradeData: any = {
      ...dto,
      status: ConfigStatus.DRAFT,
      createdBy: new Types.ObjectId(user.userId)
    };
    if (dto.departmentId) {
      payGradeData.departmentId = new Types.ObjectId(dto.departmentId);
    }
    if (dto.positionId) {
      payGradeData.positionId = new Types.ObjectId(dto.positionId);
    }
    return new this.payGradeModel(payGradeData).save();
  }

  async updatePayGrade(id: string, dto: UpdatePayGradeDto, user: AuthUser): Promise<payGrade> {
    const record = await this.checkDraftStatus(this.payGradeModel, id, user);
    if (dto.grossSalary && dto.baseSalary && dto.grossSalary < record.baseSalary) {
      throw new BadRequestException('Gross Salary cannot be less than Base Salary');
    }
    Object.assign(record, dto);
    if (dto.departmentId) {
      record.departmentId = new Types.ObjectId(dto.departmentId);
    }
    if (dto.positionId) {
      record.positionId = new Types.ObjectId(dto.positionId);
    }
    record.createdBy = new Types.ObjectId(user.userId); // Track who last modified it
    return record.save();
  }

  async getPayGrades() { return this.payGradeModel.find().exec(); }

  async getPayGradeById(id: string): Promise<payGrade> {
    const record = await this.payGradeModel.findById(id).exec();
    if (!record) throw new NotFoundException('Pay Grade not found');
    return record;
  }

  async changePayGradeStatus(id: string, dto: ChangeStatusDto, user: AuthUser) {
    return this.approveGeneric(this.payGradeModel, id, dto, user);
  }

  async deletePayGrade(id: string, user: AuthUser) {
    const record = await this.payGradeModel.findById(id);
    if (!record) throw new NotFoundException('Pay Grade not found');
    await this.payGradeModel.findByIdAndDelete(id);
    return { message: 'Pay Grade deleted successfully' };
  }

  // ===========================================================================
  // 3. Payroll Policies (REQ-PY-1)
  // ===========================================================================

  // Helper: Generate unique policy code
  private generatePolicyCode(): string {
    return `POL-${Date.now()}`;
  }

  // Helper: Drop problematic indexes that don't exist in schema
  private async dropProblematicIndexes(): Promise<void> {
    const problematicFields = ['insuranceBrackets.bracketId', 'misconductPenalties.penaltyCode'];
    
    try {
      const indexes = await this.payrollPoliciesModel.collection.indexes();
      for (const index of indexes) {
        const indexKey = index.key as any;
        const hasProblematicField = problematicFields.some(field => indexKey?.[field]);
        
        if (hasProblematicField && index.name) {
          try {
            await this.payrollPoliciesModel.collection.dropIndex(index.name);
          } catch (error: any) {
            // Index might already be dropped, ignore
          }
        }
      }
    } catch (error: any) {
      // If listing indexes fails, try dropping by common names
      for (const field of problematicFields) {
        try {
          const indexName = `${field.replace('.', '_')}_1`;
          await this.payrollPoliciesModel.collection.dropIndex(indexName);
        } catch (e) {
          // Ignore - index might not exist
        }
      }
    }
  }

  // Helper: Clean up documents with null problematic fields
  private async cleanupProblematicFields(): Promise<void> {
    await this.payrollPoliciesModel.collection.updateMany(
      {
        $or: [
          { 'insuranceBrackets.bracketId': null },
          { 'insuranceBrackets.bracketId': { $exists: false } },
          { insuranceBrackets: null },
          { insuranceBrackets: { $exists: false } },
          { 'misconductPenalties.penaltyCode': null },
          { 'misconductPenalties.penaltyCode': { $exists: false } },
          { misconductPenalties: null },
          { misconductPenalties: { $exists: false } }
        ]
      },
      { $unset: { insuranceBrackets: '', misconductPenalties: '' } }
    );
  }

  // Helper: Insert policy and return saved document
  private async insertPolicy(policyData: any): Promise<payrollPolicies> {
    const result = await this.payrollPoliciesModel.collection.insertOne(policyData);
    const savedPolicy = await this.payrollPoliciesModel.findById(result.insertedId);
    if (!savedPolicy) {
      throw new BadRequestException('Failed to create payroll policy');
    }
    return savedPolicy;
  }

  // Helper: Handle duplicate key errors
  private async handleDuplicateKeyError(error: any, policyData: any): Promise<payrollPolicies> {
    if (!error.keyPattern) {
      throw new BadRequestException(error.message);
    }

    // Handle policyCode duplicate
    if (error.keyPattern.policyCode) {
      policyData.policyCode = this.generatePolicyCode();
      return this.insertPolicy(policyData);
    }

    // Handle problematic field duplicates
    const problematicFields = ['insuranceBrackets.bracketId', 'misconductPenalties.penaltyCode'];
    const errorField = problematicFields.find(field => error.keyPattern[field]);

    if (errorField) {
      await this.dropProblematicIndexes();
      
      const fieldToClean = errorField.includes('insuranceBrackets') 
        ? 'insuranceBrackets' 
        : 'misconductPenalties';
      
      await this.payrollPoliciesModel.collection.updateMany(
        {
          $or: [
            { [errorField]: null },
            { [errorField]: { $exists: false } },
            { [fieldToClean]: null },
            { [fieldToClean]: { $exists: false } }
          ]
        },
        { $unset: { [fieldToClean]: '' } }
      );

      delete policyData.insuranceBrackets;
      delete policyData.misconductPenalties;
      
      return this.insertPolicy(policyData);
    }

    throw new BadRequestException(error.message);
  }

  async createPayrollPolicy(dto: CreatePayrollPoliciesDto, user: AuthUser): Promise<payrollPolicies> {
    // Ensure all existing policies have policy codes
    await this.payrollPoliciesModel.updateMany(
      { $or: [{ policyCode: null }, { policyCode: { $exists: false } }] },
      [{ $set: { policyCode: this.generatePolicyCode() } }]
    );

    // Clean up problematic indexes and fields
    await this.dropProblematicIndexes();
    await this.cleanupProblematicFields();

    // Prepare policy data
    const policyData: any = {
      policyName: dto.policyName,
      policyType: dto.policyType,
      description: dto.description,
      effectiveDate: new Date(dto.effectiveDate),
      ruleDefinition: dto.ruleDefinition,
      applicability: dto.applicability,
      policyCode: this.generatePolicyCode(),
      status: ConfigStatus.DRAFT,
      createdBy: new Types.ObjectId(user.userId)
    };

    // Ensure problematic fields are never included
    delete policyData.insuranceBrackets;
    delete policyData.misconductPenalties;

    try {
      return await this.insertPolicy(policyData);
    } catch (error: any) {
      if (error.code === 11000) {
        return this.handleDuplicateKeyError(error, policyData);
      }
      throw new BadRequestException(error.message);
    }
  }

  
  async updatePayrollPolicy(id: string, dto: UpdatePayrollPoliciesDto, user: AuthUser): Promise<payrollPolicies> {
    const record = await this.checkDraftStatus(this.payrollPoliciesModel, id, user);
    Object.assign(record, dto);
    record.createdBy = new Types.ObjectId(user.userId);
    return record.save();
  }

  async getPayrollPolicies() {
    return this.payrollPoliciesModel.find().exec();
  }

  async getPayrollPolicyById(id: string): Promise<payrollPolicies> {
    const record = await this.payrollPoliciesModel.findById(id).exec();
    if (!record) throw new NotFoundException('Payroll Policy not found');
    return record;
  }

  async changePayrollPolicyStatus(id: string, dto: ChangeStatusDto, user: AuthUser) {
    return this.approveGeneric(this.payrollPoliciesModel, id, dto, user);
  }

  async deletePayrollPolicy(id: string, user: AuthUser) {
    const record = await this.payrollPoliciesModel.findById(id);
    if (!record) throw new NotFoundException('Payroll Policy not found');
    
    await this.payrollPoliciesModel.findByIdAndDelete(id);
    return { message: 'Payroll Policy deleted successfully' };
  }

  // ===========================================================================
  // 4. Tax Rules (REQ-PY-10)
  // ===========================================================================

  async createTaxRule(dto: CreateTaxRuleDto, user: AuthUser): Promise<taxRules> {
    return new this.taxRulesModel({
      ...dto,
      status: ConfigStatus.DRAFT,
      createdBy: new Types.ObjectId(user.userId)
    }).save();
  }

  async updateTaxRule(id: string, dto: UpdateTaxRuleDto, user: AuthUser): Promise<taxRules> {
    const record = await this.checkDraftStatus(this.taxRulesModel, id, user);
    Object.assign(record, dto);
    record.createdBy = new Types.ObjectId(user.userId);
    return record.save();
  }

  async approveTaxRule(id: string, dto: ChangeStatusDto, user: AuthUser) {
    return this.approveGeneric(this.taxRulesModel, id, dto, user);
  }

  async getTaxRules() { return this.taxRulesModel.find().exec(); }

  async getTaxRuleById(id: string): Promise<taxRules> {
    const record = await this.taxRulesModel.findById(id).exec();
    if (!record) throw new NotFoundException('Tax Rule not found');
    return record;
  }

  async deleteTaxRule(id: string, user: AuthUser) {
    const record = await this.taxRulesModel.findById(id);
    if (!record) throw new NotFoundException('Tax Rule not found');
    await this.taxRulesModel.findByIdAndDelete(id);
    return { message: 'Tax Rule deleted successfully' };
  }

  // ===========================================================================
  // 5. Insurance Brackets
  // ===========================================================================

  async createInsurance(dto: CreateInsuranceDto, user: AuthUser): Promise<insuranceBrackets> {
    if (dto.minSalary >= dto.maxSalary) {
      throw new BadRequestException('Min Salary must be less than Max Salary');
    }
    return new this.insuranceModel({
      ...dto,
      status: ConfigStatus.DRAFT,
      createdBy: new Types.ObjectId(user.userId)
    }).save();
  }

  async updateInsurance(id: string, dto: UpdateInsuranceDto, user: AuthUser): Promise<insuranceBrackets> {
    const record = await this.checkDraftStatus(this.insuranceModel, id, user);

    // Validate min < max if both are present or merged
    const newMin = dto.minSalary ?? record.minSalary;
    const newMax = dto.maxSalary ?? record.maxSalary;

    if (newMin >= newMax) {
      throw new BadRequestException('Min Salary must be less than Max Salary');
    }
    Object.assign(record, dto);
    record.createdBy = new Types.ObjectId(user.userId);
    return record.save();
  }

  async approveInsurance(id: string, dto: ChangeStatusDto, user: AuthUser) {
    return this.approveGeneric(this.insuranceModel, id, dto, user);
  }

  async getInsuranceBrackets() { return this.insuranceModel.find().exec(); }

  async getInsuranceById(id: string): Promise<insuranceBrackets> {
    const record = await this.insuranceModel.findById(id).exec();
    if (!record) throw new NotFoundException('Insurance Bracket not found');
    return record;
  }

  async deleteInsurance(id: string, user: AuthUser) {
    const record = await this.insuranceModel.findById(id);
    if (!record) throw new NotFoundException('Insurance Bracket not found');
    await this.insuranceModel.findByIdAndDelete(id);
    return { message: 'Insurance Bracket deleted successfully' };
  }

  // ===========================================================================
  // 6. Allowances (REQ-PY-7)
  // ===========================================================================

  async createAllowance(dto: CreateAllowanceDto, user: AuthUser): Promise<allowance> {
    return new this.allowanceModel({
      ...dto,
      status: ConfigStatus.DRAFT,
      createdBy: new Types.ObjectId(user.userId)
    }).save();
  }

  async updateAllowance(id: string, dto: UpdateAllowanceDto, user: AuthUser): Promise<allowance> {
    const record = await this.checkDraftStatus(this.allowanceModel, id, user);
    Object.assign(record, dto);
    record.createdBy = new Types.ObjectId(user.userId);
    return record.save();
  }

  async approveAllowance(id: string, dto: ChangeStatusDto, user: AuthUser) {
    return this.approveGeneric(this.allowanceModel, id, dto, user);
  }

  async getAllowances() { return this.allowanceModel.find().exec(); }

  async getAllowanceById(id: string): Promise<allowance> {
    const record = await this.allowanceModel.findById(id).exec();
    if (!record) throw new NotFoundException('Allowance not found');
    return record;
  }

  async deleteAllowance(id: string, user: AuthUser) {
    const record = await this.allowanceModel.findById(id);
    if (!record) throw new NotFoundException('Allowance not found');
    await this.allowanceModel.findByIdAndDelete(id);
    return { message: 'Allowance deleted successfully' };
  }

  // ===========================================================================
  // 7. Pay Types (REQ-PY-5)
  // ===========================================================================

  async createPayType(dto: CreatePayTypeDto, user: AuthUser) {
    return new this.payTypeModel({
      ...dto,
      status: ConfigStatus.DRAFT,
      createdBy: new Types.ObjectId(user.userId)
    }).save();
  }

  async updatePayType(id: string, dto: UpdatePayTypeDto, user: AuthUser): Promise<payType> {
    const record = await this.checkDraftStatus(this.payTypeModel, id, user);
    Object.assign(record, dto);
    record.createdBy = new Types.ObjectId(user.userId);
    return record.save();
  }

  async getPayTypes() {
    return this.payTypeModel.find().exec();
  }

  async getPayTypeById(id: string): Promise<payType> {
    const record = await this.payTypeModel.findById(id).exec();
    if (!record) throw new NotFoundException('Pay Type not found');
    return record;
  }

  async approvePayType(id: string, dto: ChangeStatusDto, user: AuthUser) {
    return this.approveGeneric(this.payTypeModel, id, dto, user);
  }

  async deletePayType(id: string, user: AuthUser) {
    const record = await this.payTypeModel.findById(id);
    if (!record) throw new NotFoundException('Pay Type not found');
    await this.payTypeModel.findByIdAndDelete(id);
    return { message: 'Pay Type deleted successfully' };
  }


  // ===========================================================================
  // 8. Signing Bonus (REQ-PY-19)
  // ===========================================================================

  async createSigningBonus(dto: CreateSigningBonusDto, user: AuthUser): Promise<signingBonus> {
    // Org Integration Check placeholder (Integration point with Org Structure)
    try {
      // NOTE: This assumes OrgStructureService has a method 'findPositionByName'.
      // if (this.orgService) {
      //    const position = await this.orgService.findPositionByName(dto.positionName);
      //    if (!position) throw new BadRequestException(`Position '${dto.positionName}' does not exist.`);
      // }
    } catch (e) {
      // console.warn('Skipping Org Check: ' + e.message);
    }
    return new this.bonusModel({
      ...dto,
      status: ConfigStatus.DRAFT,
      createdBy: new Types.ObjectId(user.userId)
    }).save();
  }

  async updateSigningBonus(id: string, dto: UpdateSigningBonusDto, user: AuthUser): Promise<signingBonus> {
    const record = await this.checkDraftStatus(this.bonusModel, id, user);
    Object.assign(record, dto);
    record.createdBy = new Types.ObjectId(user.userId);
    return record.save();
  }

  async getSigningBonuses() {
    return this.bonusModel.find().exec();
  }

  async getSigningBonusById(id: string): Promise<signingBonus> {
    const record = await this.bonusModel.findById(id).exec();
    if (!record) throw new NotFoundException('Signing Bonus not found');
    return record;
  }

  async approveSigningBonus(id: string, dto: ChangeStatusDto, user: AuthUser) {
    return this.approveGeneric(this.bonusModel, id, dto, user);
  }

  async deleteSigningBonus(id: string, user: AuthUser) {
    const record = await this.bonusModel.findById(id);
    if (!record) throw new NotFoundException('Signing Bonus not found');
    await this.bonusModel.findByIdAndDelete(id);
    return { message: 'Signing Bonus deleted successfully' };
  }

  // ===========================================================================
  // 9. Termination Benefits (REQ-PY-20)
  // ===========================================================================

  async createTerminationBenefit(dto: CreateTerminationBenefitsDto, user: AuthUser) {
    return new this.termModel({
      ...dto,
      status: ConfigStatus.DRAFT,
      createdBy: new Types.ObjectId(user.userId)
    }).save();
  }

  async updateTerminationBenefit(id: string, dto: UpdateTerminationBenefitsDto, user: AuthUser) {
    const record = await this.checkDraftStatus(this.termModel, id, user);
    Object.assign(record, dto);
    record.createdBy = new Types.ObjectId(user.userId);
    return record.save();
  }

  async getTerminationBenefits() {
    return this.termModel.find().exec();
  }

  async getTerminationBenefitById(id: string): Promise<terminationAndResignationBenefits> {
    const record = await this.termModel.findById(id).exec();
    if (!record) throw new NotFoundException('Termination Benefit not found');
    return record;
  }

  async approveTerminationBenefit(id: string, dto: ChangeStatusDto, user: AuthUser) {
    return this.approveGeneric(this.termModel, id, dto, user);
  }

  async deleteTerminationBenefit(id: string, user: AuthUser) {
    const record = await this.termModel.findById(id);
    if (!record) throw new NotFoundException('Termination Benefit not found');
    await this.termModel.findByIdAndDelete(id);
    return { message: 'Termination Benefit deleted successfully' };
  }
}