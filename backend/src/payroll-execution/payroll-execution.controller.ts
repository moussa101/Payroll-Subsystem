import { Controller, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PayrollExecutionService } from './payroll-execution.service'; // Matches your file name
import { InitiatePayrollDto } from './dto/initiate-payroll.dto';
import { ReviewPayrollDto } from './dto/review-payroll.dto';
import { Roles } from '../auth/decorators/roles.decorator'; // Verify this path in your project
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Verify this path
import { RolesGuard } from '../auth/guards/roles.guard';       // Verify this path

@Controller('payroll-execution') // Matches your module name
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollExecutionController {
  constructor(private payrollService: PayrollExecutionService) {}

  // 1. Initiate Payroll (Phase 1) [cite: 246]
  @Post('initiate')
  @Roles('PAYROLL_SPECIALIST')
  async initiatePayroll(@Body() body: InitiatePayrollDto, @Request() req) {
    return this.payrollService.initiatePayroll(body.period, req.user.role);
  }

  // 2. Submit for Review (Phase 3) [cite: 261]
  @Patch(':id/submit-review')
  @Roles('PAYROLL_SPECIALIST')
  async submitForReview(@Param('id') id: string) {
    return this.payrollService.submitForReview(id);
  }

  // 3. Manager Approval (Phase 3) [cite: 263]
  @Patch(':id/manager-review')
  @Roles('PAYROLL_MANAGER')
  async managerReview(@Param('id') id: string, @Body() body: ReviewPayrollDto) {
    return this.payrollService.managerReview(id, body.approved, body.reason);
  }

  // 4. Finance Approval (Phase 3/5) [cite: 265]
  @Patch(':id/finance-review')
  @Roles('FINANCE_STAFF')
  async financeReview(@Param('id') id: string, @Body() body: ReviewPayrollDto) {
    return this.payrollService.financeReview(id, body.approved, body.reason);
  }
}