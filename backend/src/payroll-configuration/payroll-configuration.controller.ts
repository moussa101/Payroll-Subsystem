import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PayrollConfigurationService } from './payroll-configuration.service';
import { Request } from 'express';
import { Types } from 'mongoose';

// --- Auth Imports ---
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Adjust path if needed based on your structure
import { RolesGuard } from '../auth/guards/roles.guard'; // Adjust path if needed
import { Roles, Public } from '../auth/decorators/roles.decorators';
import { UserRole } from '../auth/permissions.constant';
import { AuthUser } from '../auth/auth-user.interface';

// --- DTOs (Create & Update) ---
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

@Controller('payroll-config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollConfigurationController {
  constructor(private readonly configService: PayrollConfigurationService) {}

  // Mock user for testing when endpoints are public
  private getMockUser(): AuthUser {
    // Use a valid MongoDB ObjectId for testing (consistent for all test operations)
    // This is a valid 24-character hex string ObjectId
    // Changed to SYSTEM_ADMIN for full testing access
    return {
      userId: '507f1f77bcf86cd799439011', // Valid ObjectId string for testing
      email: 'admin@example.com',
      role: UserRole.SYSTEM_ADMIN, // Admin role for full access to all features
    };
  }

  // ===========================================================================
  // 1. Company Wide Settings
  // ===========================================================================
  
  @Post('settings')
  // @Roles(UserRole.SYSTEM_ADMIN, UserRole.PAYROLL_MANAGER) // TODO: Restore after testing
  @Public() // Make public for testing - remove this in production
  createSettings(@Body() dto: CreateCompanySettingsDto) { 
    return this.configService.createSettings(dto); 
  }

  @Put('settings')
  // @Roles(UserRole.SYSTEM_ADMIN, UserRole.PAYROLL_MANAGER) // TODO: Restore after testing
  @Public() // Make public for testing - remove this in production
  updateSettings(@Body() dto: UpdateCompanySettingsDto) { 
    return this.configService.updateSettings(dto); 
  }
  
  @Get('settings')
  // @Roles(UserRole.SYSTEM_ADMIN, UserRole.PAYROLL_MANAGER, UserRole.HR_MANAGER) // TODO: Restore after testing
  @Public() // Make public for testing - remove this in production
  getSettings() { return this.configService.getSettings(); }


  // ===========================================================================
  // 2. Pay Grades
  // ===========================================================================

  @Post('pay-grades')
  @Public() // Make public for testing - remove this in production
  createPayGrade(@Body() dto: CreatePayGradeDto) {
    return this.configService.createPayGrade(dto, this.getMockUser());
  }
  
  @Put('pay-grades/:id')
  @Public() // Make public for testing - remove this in production
  updatePayGrade(@Param('id') id: string, @Body() dto: UpdatePayGradeDto) {
    return this.configService.updatePayGrade(id, dto, this.getMockUser());
  }

  @Get('pay-grades')
  @Public() // Make public for testing - remove this in production
  getPayGrades() { return this.configService.getPayGrades(); }

  @Get('pay-grades/:id')
  @Public() // Make public for testing - remove this in production
  getPayGradeById(@Param('id') id: string) { return this.configService.getPayGradeById(id); }
  
  @Patch('pay-grades/:id/status')
  @Public() // Make public for testing - remove this in production
  changePayGradeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    return this.configService.changePayGradeStatus(id, dto, this.getMockUser());
  }

  @Delete('pay-grades/:id')
  @Public() // Make public for testing - remove this in production
  deletePayGrade(@Param('id') id: string) {
    return this.configService.deletePayGrade(id, this.getMockUser());
  }


  // ===========================================================================
  // 3. Payroll Policies
  // ===========================================================================

  @Post('policies')
  @Public() // Make public for testing - remove this in production
  async createPayrollPolicy(@Body() dto: CreatePayrollPoliciesDto) {
    try {
      console.log('Received createPayrollPolicy request:', JSON.stringify(dto, null, 2));
      const result = await this.configService.createPayrollPolicy(dto, this.getMockUser());
      console.log('Successfully created payroll policy:', (result as any)._id);
      return result;
    } catch (error: any) {
      console.error('Error in createPayrollPolicy controller:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  @Put('policies/:id')
  @Public() // Make public for testing - remove this in production
  updatePayrollPolicy(@Param('id') id: string, @Body() dto: UpdatePayrollPoliciesDto) {
    return this.configService.updatePayrollPolicy(id, dto, this.getMockUser());
  }

  @Get('policies')
  @Public() // Make public for testing - remove this in production
  getPayrollPolicies() { return this.configService.getPayrollPolicies(); }

  @Get('policies/:id')
  @Public() // Make public for testing - remove this in production
  getPayrollPolicyById(@Param('id') id: string) { return this.configService.getPayrollPolicyById(id); }
  
  @Patch('policies/:id/status')
  @Public() // Make public for testing - remove this in production
  changePayrollPolicyStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    return this.configService.changePayrollPolicyStatus(id, dto, this.getMockUser());
  }

  @Delete('policies/:id')
  @Public() // Make public for testing - remove this in production
  deletePayrollPolicy(@Param('id') id: string) {
    return this.configService.deletePayrollPolicy(id, this.getMockUser());
  }

  // ===========================================================================
  // 4. Tax Rules
  // ===========================================================================

  @Post('tax-rules')
  @Public() // Make public for testing - remove this in production
  createTaxRule(@Body() dto: CreateTaxRuleDto) {
    return this.configService.createTaxRule(dto, this.getMockUser());
  }

  @Put('tax-rules/:id')
  @Public() // Make public for testing - remove this in production
  updateTaxRule(@Param('id') id: string, @Body() dto: UpdateTaxRuleDto) {
    return this.configService.updateTaxRule(id, dto, this.getMockUser());
  }

  @Get('tax-rules')
  @Public() // Make public for testing - remove this in production
  getTaxRules() { return this.configService.getTaxRules(); }

  @Get('tax-rules/:id')
  @Public() // Make public for testing - remove this in production
  getTaxRuleById(@Param('id') id: string) { return this.configService.getTaxRuleById(id); }

  @Patch('tax-rules/:id/status')
  @Public() // Make public for testing - remove this in production
  changeTaxStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    return this.configService.approveTaxRule(id, dto, this.getMockUser());
  }

  @Delete('tax-rules/:id')
  @Public() // Make public for testing - remove this in production
  deleteTaxRule(@Param('id') id: string) {
    return this.configService.deleteTaxRule(id, this.getMockUser());
  }

  // ===========================================================================
  // 5. Insurance
  // ===========================================================================

  @Post('insurance')
  @Public() // Make public for testing - remove this in production
  createInsurance(@Body() dto: CreateInsuranceDto) {
    return this.configService.createInsurance(dto, this.getMockUser());
  }

  @Put('insurance/:id')
  @Public() // Make public for testing - remove this in production
  updateInsurance(@Param('id') id: string, @Body() dto: UpdateInsuranceDto) {
    return this.configService.updateInsurance(id, dto, this.getMockUser());
  }

  @Get('insurance')
  @Public() // Make public for testing - remove this in production
  getInsurance() { return this.configService.getInsuranceBrackets(); }

  @Get('insurance/:id')
  @Public() // Make public for testing - remove this in production
  getInsuranceById(@Param('id') id: string) { return this.configService.getInsuranceById(id); }

  @Patch('insurance/:id/status')
  @Public() // Make public for testing - remove this in production
  changeInsuranceStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    return this.configService.approveInsurance(id, dto, this.getMockUser());
  }

  @Delete('insurance/:id')
  @Public() // Make public for testing - remove this in production
  deleteInsurance(@Param('id') id: string) {
    return this.configService.deleteInsurance(id, this.getMockUser());
  }


  // ===========================================================================
  // 6. Allowances
  // ===========================================================================

  @Post('allowances')
  @Public() // Make public for testing - remove this in production
  createAllowance(@Body() dto: CreateAllowanceDto) {
    return this.configService.createAllowance(dto, this.getMockUser());
  }
  
  @Put('allowances/:id')
  @Public() // Make public for testing - remove this in production
  updateAllowance(@Param('id') id: string, @Body() dto: UpdateAllowanceDto) {
    return this.configService.updateAllowance(id, dto, this.getMockUser());
  }

  @Get('allowances')
  @Public() // Make public for testing - remove this in production
  getAllowances() { return this.configService.getAllowances(); }

  @Get('allowances/:id')
  @Public() // Make public for testing - remove this in production
  getAllowanceById(@Param('id') id: string) { return this.configService.getAllowanceById(id); }

  @Patch('allowances/:id/status')
  @Public() // Make public for testing - remove this in production
  changeAllowanceStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    return this.configService.approveAllowance(id, dto, this.getMockUser());
  }

  @Delete('allowances/:id')
  @Public() // Make public for testing - remove this in production
  deleteAllowance(@Param('id') id: string) {
    return this.configService.deleteAllowance(id, this.getMockUser());
  }

  // ===========================================================================
  // 7. Pay Types
  // ===========================================================================

  @Post('pay-types')
  @Public() // Make public for testing - remove this in production
  createPayType(@Body() dto: CreatePayTypeDto) {
    return this.configService.createPayType(dto, this.getMockUser());
  }

  @Put('pay-types/:id')
  @Public() // Make public for testing - remove this in production
  updatePayType(@Param('id') id: string, @Body() dto: UpdatePayTypeDto) {
    return this.configService.updatePayType(id, dto, this.getMockUser());
  }

  @Get('pay-types')
  @Public() // Make public for testing - remove this in production
  getPayTypes() { return this.configService.getPayTypes(); }

  @Get('pay-types/:id')
  @Public() // Make public for testing - remove this in production
  getPayTypeById(@Param('id') id: string) { return this.configService.getPayTypeById(id); }

  @Patch('pay-types/:id/status')
  @Public() // Make public for testing - remove this in production
  changePayTypeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    return this.configService.approvePayType(id, dto, this.getMockUser());
  }

  @Delete('pay-types/:id')
  @Public() // Make public for testing - remove this in production
  deletePayType(@Param('id') id: string) {
    return this.configService.deletePayType(id, this.getMockUser());
  }

  // ===========================================================================
  // 8. Signing Bonuses
  // ===========================================================================

  @Post('signing-bonuses')
  @Public() // Make public for testing - remove this in production
  createSigningBonus(@Body() dto: CreateSigningBonusDto) {
    return this.configService.createSigningBonus(dto, this.getMockUser());
  }

  @Put('signing-bonuses/:id')
  @Public() // Make public for testing - remove this in production
  updateSigningBonus(@Param('id') id: string, @Body() dto: UpdateSigningBonusDto) {
    return this.configService.updateSigningBonus(id, dto, this.getMockUser());
  }

  @Get('signing-bonuses')
  @Public() // Make public for testing - remove this in production
  getSigningBonuses() { return this.configService.getSigningBonuses(); }

  @Get('signing-bonuses/:id')
  @Public() // Make public for testing - remove this in production
  getSigningBonusById(@Param('id') id: string) { return this.configService.getSigningBonusById(id); }

  @Patch('signing-bonuses/:id/status')
  @Public() // Make public for testing - remove this in production
  changeBonusStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    return this.configService.approveSigningBonus(id, dto, this.getMockUser());
  }

  @Delete('signing-bonuses/:id')
  @Public() // Make public for testing - remove this in production
  deleteSigningBonus(@Param('id') id: string) {
    return this.configService.deleteSigningBonus(id, this.getMockUser());
  }

  // ===========================================================================
  // 9. Termination Benefits
  // ===========================================================================

  @Post('termination-benefits')
  @Public() // Make public for testing - remove this in production
  createTermination(@Body() dto: CreateTerminationBenefitsDto) {
    return this.configService.createTerminationBenefit(dto, this.getMockUser());
  }

  @Put('termination-benefits/:id')
  @Public() // Make public for testing - remove this in production
  updateTermination(@Param('id') id: string, @Body() dto: UpdateTerminationBenefitsDto) {
    return this.configService.updateTerminationBenefit(id, dto, this.getMockUser());
  }

  @Get('termination-benefits')
  @Public() // Make public for testing - remove this in production
  getTerminationBenefits() { return this.configService.getTerminationBenefits(); }

  @Get('termination-benefits/:id')
  @Public() // Make public for testing - remove this in production
  getTerminationBenefitById(@Param('id') id: string) { return this.configService.getTerminationBenefitById(id); }
  
  @Patch('termination-benefits/:id/status')
  @Public() // Make public for testing - remove this in production
  changeTermStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    return this.configService.approveTerminationBenefit(id, dto, this.getMockUser());
  }

  @Delete('termination-benefits/:id')
  @Public() // Make public for testing - remove this in production
  deleteTerminationBenefit(@Param('id') id: string) {
    return this.configService.deleteTerminationBenefit(id, this.getMockUser());
  }
}