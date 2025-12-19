import { Controller, Get, Param, Post, Sse, UseGuards } from '@nestjs/common';
import { PayrollTrackingService } from './payroll-tracking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FinanceNotification, FinanceNotificationsService } from './notifications/finance-notifications.service';
import { Observable } from 'rxjs';
import { RefundsService } from './services/refunds.service';

@Controller('payroll-tracking')
@UseGuards(JwtAuthGuard)
export class PayrollTrackingController {
  constructor(
    private readonly trackingService: PayrollTrackingService,
    private readonly financeNotifications: FinanceNotificationsService,
    private readonly refundsService: RefundsService,
  ) {}

  @Get('reports/compliance')
  taxInsuranceReport() {
    return this.trackingService.taxInsuranceReport();
  }

  @Get('reports/summary')
  payrollSummaries() {
    return this.trackingService.payrollSummaries();
  }

  @Get('reports/department')
  departmentReport() {
    return this.trackingService.departmentReport();
  }

  // Finance queues
  @Get('reports/finance/approved-claims')
  approvedClaimsForFinance() {
    return this.trackingService.getApprovedClaimsForFinance();
  }

  @Get('reports/finance/approved-disputes')
  approvedDisputesForFinance() {
    return this.trackingService.getApprovedDisputesForFinance();
  }

  @Get('reports/payroll/monthly')
  monthlySummary() {
    return this.trackingService.monthlyPayrollSummary();
  }

  @Sse('notifications/finance/stream')
  financeStream(): Observable<FinanceNotification> {
    return this.financeNotifications.stream();
  }

  @Get('notifications/finance/recent')
  financeRecent(): FinanceNotification[] {
    return this.financeNotifications.getRecent();
  }

  @Post('refunds/apply/:payrollRunId')
  applyRefunds(@Param('payrollRunId') payrollRunId: string) {
    return this.refundsService.applyPendingRefunds(payrollRunId);
  }
}
