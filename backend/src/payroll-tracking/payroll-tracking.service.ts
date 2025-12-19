import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { paySlip } from '../payroll-execution/models/payslip.schema';
import { payrollRuns } from '../payroll-execution/models/payrollRuns.schema';
import { disputes } from './models/disputes.schema';
import { claims } from './models/claims.schema';
import { AuthUser } from '../auth/auth-user.interface';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import { ClaimStatus, DisputeStatus } from './enums/payroll-tracking-enum';

@Injectable()
export class PayrollTrackingService {
  constructor(
    @InjectModel(paySlip.name) private readonly payslipModel: Model<paySlip>,
    @InjectModel(payrollRuns.name)
    private readonly payrollRunModel: Model<payrollRuns>,
    @InjectModel(disputes.name) private readonly disputeModel: Model<disputes>,
    @InjectModel(claims.name) private readonly claimModel: Model<claims>,
  ) {}

  private getRoles(user: AuthUser) {
    return [user.role, ...(user.roles ?? [])].filter(Boolean) as SystemRole[];
  }

  private isPrivileged(user: AuthUser) {
    const roles = this.getRoles(user);
    return roles.some((r) =>
      [
        SystemRole.SYSTEM_ADMIN,
        SystemRole.FINANCE_STAFF,
        SystemRole.PAYROLL_MANAGER,
        SystemRole.PAYROLL_SPECIALIST,
      ].includes(r),
    );
  }

  private assertSelfOrPrivileged(
    employeeId: string | undefined,
    user: AuthUser,
    action = 'access this payslip',
  ) {
    if (this.isPrivileged(user)) return;
    if (!employeeId || employeeId.toString() !== user.employeeId) {
      throw new ForbiddenException(`You can only ${action}`);
    }
  }

  async getPayslips(user: AuthUser) {
    const filter = this.isPrivileged(user) ? {} : { employeeId: user.employeeId };
    const slips = await this.payslipModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate(['employeeId', 'payrollRunId'])
      .exec();
    // pre-fetch disputes linked to these payslips
    const ids = slips.map((s) => s._id);
    const disputes = await this.disputeModel
      .find({ payslipId: { $in: ids } })
      .select(['disputeId', 'status', 'payslipId'])
      .exec();
    return slips.map((p) => this.toClientPayslip(p, disputes));
  }

  async getSalaryHistory(user: AuthUser) {
    const slips = await this.getPayslips(user);
    return {
      count: slips.length,
      history: slips,
    };
  }

  async getPayslipById(id: string, user: AuthUser) {
    const slip = await this.payslipModel
      .findById(id)
      .populate(['employeeId', 'payrollRunId'])
      .exec();

    if (!slip) throw new NotFoundException(`Payslip ${id} not found`);
    this.assertSelfOrPrivileged(slip.employeeId?.toString(), user);
    const dispute = await this.disputeModel
      .findOne({ payslipId: slip._id })
      .select(['disputeId', 'status'])
      .exec();
    return this.toClientPayslip(slip, dispute ? [dispute] : []);
  }

  async generatePayslipPdf(payslip: any): Promise<Buffer> {
    const lines = [
      `Payslip for ${payslip.employee?.fullName ?? payslip.employee ?? 'Employee'}`,
      `Payroll run: ${payslip.payrollRun?.runId ?? payslip.payrollRunId ?? ''}`,
      `Base salary: ${payslip.earnings?.baseSalary ?? 0}`,
      `Allowances: ${(payslip.earnings?.allowances ?? [])
        .map((a) => `${a.name ?? 'Allowance'} - ${a.amount ?? 0}`)
        .join(', ')}`,
      `Bonuses: ${(payslip.earnings?.bonuses ?? [])
        .map((b) => `${b.name ?? 'Bonus'} - ${b.amount ?? 0}`)
        .join(', ')}`,
      `Deductions: ${(payslip.deductions?.taxes ?? [])
        .map((t) => `${t.name ?? 'Tax'} - ${t.rate ?? 0}%`)
        .join(', ')}`,
      `Insurance: ${(payslip.deductions?.insurances ?? [])
        .map((i) => `${i.name ?? 'Insurance'} - ${i.employeeRate ?? 0}%`)
        .join(', ')}`,
      `Penalties: ${
        payslip.deductions?.penalties
          ? JSON.stringify(payslip.deductions.penalties)
          : 'None'
      }`,
      `Net pay: ${payslip.netPay}`,
      `Payment status: ${payslip.paymentStatus}`,
    ];
    return Buffer.from(lines.join('\n'));
  }

  private toClientPayslip(doc: any, disputes: any[] = []) {
    const payrollRun =
      (doc.payrollRunId as any)?.runId ??
      (doc.payrollRunId as any)?._id ??
      doc.payrollRunId;
    const employee =
      (doc.employeeId as any)?.fullName ??
      (doc.employeeId as any)?.name ??
      (doc.employeeId as any)?._id ??
      doc.employeeId;
    const contractType = (doc.employeeId as any)?.contractType;
    const workType = (doc.employeeId as any)?.workType;
    const department =
      (doc.employeeId as any)?.primaryDepartmentId?.name ??
      (doc.employeeId as any)?.primaryDepartmentId ??
      undefined;

    const earnings = {
      baseSalary: doc.earningsDetails?.baseSalary ?? 0,
      allowances: doc.earningsDetails?.allowances ?? [],
      transportAllowances: (doc.earningsDetails?.allowances ?? []).filter((a: any) =>
        `${a.name ?? ''}`.toLowerCase().includes('transport') ||
        `${a.name ?? ''}`.toLowerCase().includes('commute'),
      ),
      bonuses: doc.earningsDetails?.bonuses ?? [],
      benefits: doc.earningsDetails?.benefits ?? [],
      leaveEncashment: (doc.earningsDetails?.benefits ?? []).filter((b: any) =>
        `${b.name ?? ''}`.toLowerCase().includes('leave'),
      ),
      refunds: doc.earningsDetails?.refunds ?? [],
      allowUnpaidLeave: doc.earningsDetails?.allowUnpaidLeave ?? [],
    };
    const deductions = {
      taxes: doc.deductionsDetails?.taxes ?? [],
      insurances: doc.deductionsDetails?.insurances ?? [],
      penalties: doc.deductionsDetails?.penalties ?? null,
      unpaidLeave: (() => {
        const penalties = (doc.deductionsDetails as any)?.penalties?.penalties ?? [];
        return Array.isArray(penalties)
          ? penalties.filter((p: any) =>
              `${p.reason ?? ''}`.toLowerCase().includes('unpaid leave'),
            )
          : [];
      })(),
    };

    const gross = Number(doc.totalGrossSalary ?? 0);
    const employerInsuranceContributions = (deductions.insurances ?? []).map((i: any) => ({
      name: i.name ?? 'Insurance',
      employerRate: i.employerRate ?? 0,
      amount: gross * Number(i.employerRate ?? 0) / 100,
    }));

    const dispute = disputes.find(
      (d) => `${d.payslipId ?? d.payslipId?.toString?.()}` === `${doc._id}`,
    );

    return {
      id: doc._id?.toString() ?? '',
      payrollRun,
      employee,
      department,
      contractType,
      workType,
      earnings,
      deductions,
      totalGrossSalary: doc.totalGrossSalary ?? 0,
      totalDeductions: doc.totaDeductions ?? 0,
      netPay: doc.netPay ?? 0,
      paymentStatus: doc.paymentStatus,
      dispute: dispute
        ? { disputeId: dispute.disputeId, status: dispute.status }
        : undefined,
      employerInsuranceContributions,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async taxInsuranceReport(year?: number) {
    const dateFilter =
      year && Number.isFinite(year)
        ? { createdAt: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59) } }
        : {};
    const slips = await this.payslipModel.find(dateFilter).populate('employeeId').exec();
    const aggregate = {
      payslips: slips.length,
      totalGross: 0,
      totalNet: 0,
      taxes: 0,
      insurance: 0,
      penalties: 0,
      employerInsurance: 0,
      details: [] as {
        employee: string;
        gross: number;
        tax: number;
        insurance: number;
        employerInsurance: number;
      }[],
    };

    for (const slip of slips) {
      const gross = Number(slip.totalGrossSalary ?? 0);
      aggregate.totalGross += gross;
      aggregate.totalNet += Number(slip.netPay ?? 0);

      const taxes = (slip.deductionsDetails?.taxes ?? []).reduce(
        (sum, t: any) => sum + gross * Number(t.rate ?? 0) / 100,
        0,
      );
      const insurance = (slip.deductionsDetails?.insurances ?? []).reduce(
        (sum, i: any) => sum + gross * Number(i.employeeRate ?? 0) / 100,
        0,
      );
      const employerInsurance = (slip.deductionsDetails?.insurances ?? []).reduce(
        (sum, i: any) => sum + gross * Number(i.employerRate ?? 0) / 100,
        0,
      );
      const penaltiesArray = (slip.deductionsDetails as any)?.penalties?.penalties ?? [];
      const penalties = Array.isArray(penaltiesArray)
        ? penaltiesArray.reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0)
        : 0;

      aggregate.taxes += taxes;
      aggregate.insurance += insurance;
      aggregate.penalties += penalties;
      aggregate.employerInsurance += employerInsurance;

      aggregate.details.push({
        employee:
          (slip.employeeId as any)?.fullName ??
          (slip.employeeId as any)?.name ??
          (slip.employeeId as any)?._id?.toString() ??
          'employee',
        gross,
        tax: taxes,
        insurance,
        employerInsurance,
      });
    }

    return aggregate;
  }

  async payrollSummaries() {
    const runs = await this.payrollRunModel
      .find()
      .sort({ payrollPeriod: -1 })
      .limit(12)
      .exec();
    return runs.map((r) => ({
      runId: r.runId,
      payrollPeriod: r.payrollPeriod,
      status: r.status,
      totalnetpay: r.totalnetpay,
      employees: r.employees,
      exceptions: r.exceptions,
      paymentStatus: r.paymentStatus,
      payrollSpecialistId: r.payrollSpecialistId,
      financeStaffId: r.financeStaffId,
    }));
  }

  async departmentReport() {
    const slips = await this.payslipModel
      .find()
      .populate(['payrollRunId', 'employeeId'])
      .exec();
    const grouped: Record<
      string,
      {
        department: string;
        payslips: number;
        totalNet: number;
        allowances: number;
        taxes: number;
        insurances: number;
        benefits: number;
      }
    > = {};

    for (const slip of slips) {
      const dept =
        (slip.employeeId as any)?.primaryDepartmentId?.name ??
        (slip.employeeId as any)?.primaryDepartmentId ??
        'unassigned';
      if (!grouped[dept]) {
        grouped[dept] = {
          department: dept,
          payslips: 0,
          totalNet: 0,
          allowances: 0,
          taxes: 0,
          insurances: 0,
          benefits: 0,
        };
      }
      grouped[dept].payslips += 1;
      grouped[dept].totalNet += Number(slip.netPay ?? 0);
      grouped[dept].allowances += (slip.earningsDetails?.allowances ?? []).reduce(
        (s: number, a: any) => s + Number(a.amount ?? 0),
        0,
      );
      grouped[dept].benefits += (slip.earningsDetails?.benefits ?? []).reduce(
        (s: number, b: any) => s + Number(b.amount ?? 0),
        0,
      );
      const gross = Number(slip.totalGrossSalary ?? 0);
      grouped[dept].taxes += (slip.deductionsDetails?.taxes ?? []).reduce(
        (s: number, t: any) => s + (gross * Number(t.rate ?? 0)) / 100,
        0,
      );
      grouped[dept].insurances += (slip.deductionsDetails?.insurances ?? []).reduce(
        (s: number, i: any) => s + (gross * Number(i.employeeRate ?? 0)) / 100,
        0,
      );
    }

    return Object.values(grouped);
  }

  async getApprovedClaimsForFinance() {
    return this.claimModel
      .find({ status: ClaimStatus.APPROVED })
      .populate(['employeeId', 'financeStaffId'])
      .exec();
  }

  async getApprovedDisputesForFinance() {
    return this.disputeModel
      .find({ status: DisputeStatus.APPROVED })
      .populate(['employeeId', 'financeStaffId', 'payslipId'])
      .exec();
  }

  async monthlyPayrollSummary() {
    const runs = await this.payrollRunModel.find().exec();
    const buckets: Record<string, { period: string; totalnetpay: number; runs: number }> = {};
    for (const run of runs) {
      const dt = run.payrollPeriod ? new Date(run.payrollPeriod) : new Date();
      const key = `${dt.getFullYear()}-${(dt.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!buckets[key]) buckets[key] = { period: key, totalnetpay: 0, runs: 0 };
      buckets[key].totalnetpay += Number(run.totalnetpay ?? 0);
      buckets[key].runs += 1;
    }
    return Object.values(buckets).sort((a, b) => (a.period < b.period ? 1 : -1));
  }
}
