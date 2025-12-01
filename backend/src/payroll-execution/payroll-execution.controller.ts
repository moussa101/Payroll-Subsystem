import { Controller, Post, Patch, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PayrollExecutionService } from './payroll-execution.service';

// [FIX] Imports now match the files in your 'tree' structure
import { CreatePayrollRunsDto } from './dto/create-payroll-runs.dto'; 
import { UpdatePayrollRunsDto } from './dto/update-payroll-runs.dto';

// 2. Import Auth Guards & Decorators
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('payroll-execution')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollExecutionController {
  constructor(private payrollService: PayrollExecutionService) {}

  // =================================================================
  // 1. VIEWING DATA
  // =================================================================
  
  // Get Details by ID
  @Get(':id')
  @Roles('PAYROLL_SPECIALIST', 'PAYROLL_MANAGER', 'FINANCE_STAFF')
  async getPayrollById(@Param('id') id: string) {
    return this.payrollService.getPayrollById(id);
  }

  // =================================================================
  // 2. SPECIALIST ACTIONS
  // =================================================================

  // Phase 1: Initiation
  // [FIX] Uses CreatePayrollRunsDto (was InitiatePayrollDto)
  @Post('initiate')
  @Roles('PAYROLL_SPECIALIST')
  async initiatePayroll(@Body() body: CreatePayrollRunsDto, @Request() req) {
    // Requires body to have 'period'. ensure CreatePayrollRunsDto has this field.
    // Use a type cast to avoid TypeScript error until the DTO is updated to include 'period'.
    return this.payrollService.initiatePayroll((body as any).period, req.user.role);
  }

  // Manual Edit/Update (Phase 1 / Correction)
  // [FIX] Uses UpdatePayrollRunsDto (was 'any')
  @Patch(':id')
  @Roles('PAYROLL_SPECIALIST')
  async updatePayroll(@Param('id') id: string, @Body() body: UpdatePayrollRunsDto) {
    return this.payrollService.updatePayrollDraft(id, body);
  }

  // Phase 3: Submit for Manager Review
  @Patch(':id/submit-review')
  @Roles('PAYROLL_SPECIALIST')
  async submitForReview(@Param('id') id: string) {
    return this.payrollService.submitForReview(id);
  }

  // =================================================================
  // 3. APPROVAL WORKFLOWS
  // =================================================================

  // Phase 3: Manager Approval
  // [FIX] Uses UpdatePayrollRunsDto (was ReviewPayrollDto)
  @Patch(':id/manager-review')
  @Roles('PAYROLL_MANAGER')
  async managerReview(@Param('id') id: string, @Body() body: UpdatePayrollRunsDto) {
    // Note: The service expects 'approved' (boolean) and 'reason' (string).
    // Ensure UpdatePayrollRunsDto includes
  }
}