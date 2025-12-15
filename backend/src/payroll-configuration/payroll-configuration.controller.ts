import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PayrollConfigurationService } from './payroll-configuration.service';
import { Request } from 'express';

// --- Auth Imports ---
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Adjust path if needed based on your structure
import { RolesGuard } from '../auth/guards/roles.guard'; // Adjust path if needed
import { Roles } from '../auth/decorators/roles.decorators';
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

  // ===========================================================================
  // 1. Company Wide Settings
  // ===========================================================================
  
  @Post('settings')
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.PAYROLL_MANAGER)
  createSettings(@Body() dto: CreateCompanySettingsDto) { 
    return this.configService.createSettings(dto); 
  }

  @Put('settings')
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.PAYROLL_MANAGER)
  updateSettings(@Body() dto: UpdateCompanySettingsDto) { 
    return this.configService.updateSettings(dto); 
  }
  
  @Get('settings')
  @Roles(UserRole.SYSTEM_ADMIN, UserRole.PAYROLL_MANAGER, UserRole.HR_MANAGER)
  getSettings() { return this.configService.getSettings(); }


  // ===========================================================================
  // 2. Pay Grades
  // ===========================================================================

  @Post('pay-grades')
  @Roles(UserRole.HR_ADMIN, UserRole.PAYROLL_SPECIALIST)
  createPayGrade(@Body() dto: CreatePayGradeDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.createPayGrade(dto, req.user);
  }
  
  @Put('pay-grades/:id')
  @Roles(UserRole.HR_ADMIN, UserRole.PAYROLL_SPECIALIST)
  updatePayGrade(@Param('id') id: string, @Body() dto: UpdatePayGradeDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.updatePayGrade(id, dto, req.user);
  }

  @Get('pay-grades')
  getPayGrades() { return this.configService.getPayGrades(); }
  
  @Patch('pay-grades/:id/status')
  @Roles(UserRole.PAYROLL_MANAGER, UserRole.HR_MANAGER)
  changePayGradeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.changePayGradeStatus(id, dto, req.user);
  }

  @Delete('pay-grades/:id')
  @Roles(UserRole.PAYROLL_MANAGER)
  deletePayGrade(@Param('id') id: string, @Req() req: Request & { user: AuthUser }) {
    return this.configService.deletePayGrade(id, req.user);
  }


  // ===========================================================================
  // 3. Payroll Policies
  // ===========================================================================

  @Post('policies')
  @Roles(UserRole.PAYROLL_MANAGER)
  createPayrollPolicy(@Body() dto: CreatePayrollPoliciesDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.createPayrollPolicy(dto, req.user);
  }

  @Put('policies/:id')
  @Roles(UserRole.PAYROLL_MANAGER)
  updatePayrollPolicy(@Param('id') id: string, @Body() dto: UpdatePayrollPoliciesDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.updatePayrollPolicy(id, dto, req.user);
  }
  
  @Patch('policies/:id/status')
  @Roles(UserRole.HR_MANAGER) // Higher approval for core policies
  changePayrollPolicyStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.changePayrollPolicyStatus(id, dto, req.user);
  }

  @Delete('policies/:id')
  @Roles(UserRole.PAYROLL_MANAGER)
  deletePayrollPolicy(@Param('id') id: string, @Req() req: Request & { user: AuthUser }) {
    return this.configService.deletePayrollPolicy(id, req.user);
  }

  // ===========================================================================
  // 4. Tax Rules
  // ===========================================================================

  @Post('tax-rules')
  @Roles(UserRole.LEGAL_POLICY_ADMIN)
  createTaxRule(@Body() dto: CreateTaxRuleDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.createTaxRule(dto, req.user);
  }

  @Put('tax-rules/:id')
  @Roles(UserRole.LEGAL_POLICY_ADMIN)
  updateTaxRule(@Param('id') id: string, @Body() dto: UpdateTaxRuleDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.updateTaxRule(id, dto, req.user);
  }

  @Get('tax-rules')
  getTaxRules() { return this.configService.getTaxRules(); }

  @Patch('tax-rules/:id/status')
  @Roles(UserRole.PAYROLL_MANAGER)
  changeTaxStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.approveTaxRule(id, dto, req.user);
  }

  @Delete('tax-rules/:id')
  @Roles(UserRole.PAYROLL_MANAGER)
  deleteTaxRule(@Param('id') id: string, @Req() req: Request & { user: AuthUser }) {
    return this.configService.deleteTaxRule(id, req.user);
  }

  // ===========================================================================
  // 5. Insurance
  // ===========================================================================

  @Post('insurance')
  @Roles(UserRole.PAYROLL_SPECIALIST)
  createInsurance(@Body() dto: CreateInsuranceDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.createInsurance(dto, req.user);
  }

  @Put('insurance/:id')
  @Roles(UserRole.PAYROLL_SPECIALIST)
  updateInsurance(@Param('id') id: string, @Body() dto: UpdateInsuranceDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.updateInsurance(id, dto, req.user);
  }

  @Get('insurance')
  getInsurance() { return this.configService.getInsuranceBrackets(); }

  @Patch('insurance/:id/status')
  @Roles(UserRole.PAYROLL_MANAGER)
  changeInsuranceStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.approveInsurance(id, dto, req.user);
  }


  // ===========================================================================
  // 6. Allowances
  // ===========================================================================

  @Post('allowances')
  @Roles(UserRole.PAYROLL_SPECIALIST)
  createAllowance(@Body() dto: CreateAllowanceDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.createAllowance(dto, req.user);
  }
  
  @Put('allowances/:id')
  @Roles(UserRole.PAYROLL_SPECIALIST)
  updateAllowance(@Param('id') id: string, @Body() dto: UpdateAllowanceDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.updateAllowance(id, dto, req.user);
  }

  @Get('allowances')
  getAllowances() { return this.configService.getAllowances(); }

  @Patch('allowances/:id/status')
  @Roles(UserRole.PAYROLL_MANAGER)
  changeAllowanceStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.approveAllowance(id, dto, req.user);
  }

  @Delete('allowances/:id')
  @Roles(UserRole.PAYROLL_MANAGER)
  deleteAllowance(@Param('id') id: string, @Req() req: Request & { user: AuthUser }) {
    return this.configService.deleteAllowance(id, req.user);
  }

  // ===========================================================================
  // 7. Pay Types
  // ===========================================================================

  @Post('pay-types')
  @Roles(UserRole.PAYROLL_SPECIALIST)
  createPayType(@Body() dto: CreatePayTypeDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.createPayType(dto, req.user);
  }

  @Put('pay-types/:id')
  @Roles(UserRole.PAYROLL_SPECIALIST)
  updatePayType(@Param('id') id: string, @Body() dto: UpdatePayTypeDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.updatePayType(id, dto, req.user);
  }

  @Patch('pay-types/:id/status')
  @Roles(UserRole.PAYROLL_MANAGER)
  changePayTypeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.approvePayType(id, dto, req.user);
  }

  @Delete('pay-types/:id')
  @Roles(UserRole.PAYROLL_MANAGER)
  deletePayType(@Param('id') id: string, @Req() req: Request & { user: AuthUser }) {
    return this.configService.deletePayType(id, req.user);
  }

  // ===========================================================================
  // 8. Signing Bonuses
  // ===========================================================================

  @Post('signing-bonuses')
  @Roles(UserRole.PAYROLL_SPECIALIST, UserRole.RECRUITER)
  createSigningBonus(@Body() dto: CreateSigningBonusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.createSigningBonus(dto, req.user);
  }

  @Put('signing-bonuses/:id')
  @Roles(UserRole.PAYROLL_SPECIALIST)
  updateSigningBonus(@Param('id') id: string, @Body() dto: UpdateSigningBonusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.updateSigningBonus(id, dto, req.user);
  }

  @Patch('signing-bonuses/:id/status')
  @Roles(UserRole.PAYROLL_MANAGER)
  changeBonusStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.approveSigningBonus(id, dto, req.user);
  }

  @Delete('signing-bonuses/:id')
  @Roles(UserRole.PAYROLL_MANAGER)
  deleteSigningBonus(@Param('id') id: string, @Req() req: Request & { user: AuthUser }) {
    return this.configService.deleteSigningBonus(id, req.user);
  }

  // ===========================================================================
  // 9. Termination Benefits
  // ===========================================================================

  @Post('termination-benefits')
  @Roles(UserRole.PAYROLL_SPECIALIST)
  createTermination(@Body() dto: CreateTerminationBenefitsDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.createTerminationBenefit(dto, req.user);
  }

  @Put('termination-benefits/:id')
  @Roles(UserRole.PAYROLL_SPECIALIST)
  updateTermination(@Param('id') id: string, @Body() dto: UpdateTerminationBenefitsDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.updateTerminationBenefit(id, dto, req.user);
  }
  
  @Patch('termination-benefits/:id/status')
  @Roles(UserRole.PAYROLL_MANAGER)
  changeTermStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @Req() req: Request & { user: AuthUser }) {
    return this.configService.approveTerminationBenefit(id, dto, req.user);
  }

  @Delete('termination-benefits/:id')
  @Roles(UserRole.PAYROLL_MANAGER)
  deleteTerminationBenefit(@Param('id') id: string, @Req() req: Request & { user: AuthUser }) {
    return this.configService.deleteTerminationBenefit(id, req.user);
  }
}