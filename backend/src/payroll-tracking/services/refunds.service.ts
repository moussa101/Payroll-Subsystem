import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { refunds, refundsDocument } from '../models/refunds.schema';
import { CreateRefundDto } from '../dtos/create-refund.dto';
import { UpdateRefundDto } from '../dtos/update-refund.dto';
import { RefundStatus } from '../enums/payroll-tracking-enum';
import { claims } from '../models/claims.schema';
import { disputes } from '../models/disputes.schema';
import {
  payrollRuns,
  payrollRunsDocument,
} from '../../payroll-execution/models/payrollRuns.schema';
import { AuthUser } from '../../auth/auth-user.interface';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@Injectable()
export class RefundsService {
  constructor(
    @InjectModel(refunds.name)
    private readonly refundModel: Model<refundsDocument>,

    @InjectModel(payrollRuns.name)
    private readonly payrollRunModel: Model<payrollRunsDocument>,

  ) {}

  async create(createRefundDto: CreateRefundDto, user: AuthUser): Promise<refunds> {
    const refund = new this.refundModel({
      ...createRefundDto,
      employeeId: user.employeeId,
      financeStaffId: this.isAdmin(user) ? createRefundDto.financeStaffId ?? undefined : undefined,
    });
    return refund.save();
  }

  async findAll(user: AuthUser): Promise<refunds[]> {
    const filter = this.isAdmin(user) ? {} : { employeeId: user.employeeId };
    return this.refundModel
      .find(filter)
      .populate('claimId')
      .populate('disputeId')
      .populate('employeeId')
      .populate('financeStaffId')
      .populate('paidInPayrollRunId')
      .exec();
  }

  async findOne(id: string, user: AuthUser): Promise<refunds> {
    const refund = await this.refundModel
      .findById(id)
      .populate('claimId')
      .populate('disputeId')
      .populate('employeeId')
      .populate('financeStaffId')
      .populate('paidInPayrollRunId')
      .exec();

    if (!refund) {
      throw new NotFoundException(`Refund with id "${id}" not found`);
    }

    this.assertSelfOrAdmin(refund, user);
    return refund;
  }

  async update(id: string, updateRefundDto: UpdateRefundDto, user: AuthUser): Promise<refunds> {
    const refund = await this.refundModel.findById(id).exec();
    if (!refund) {
      throw new NotFoundException(`Refund with id "${id}" not found`);
    }

    this.assertSelfOrAdmin(refund, user, 'update this refund');

    // copy incoming DTO to a mutable object and coerce string IDs to ObjectId where appropriate
    const payloadObj: any = { ...updateRefundDto };

    // convert common ID fields from string -> ObjectId when valid strings are provided
    for (const key of ['claimId', 'disputeId', 'employeeId', 'financeStaffId', 'paidInPayrollRunId']) {
      const val = payloadObj[key];
      if (typeof val === 'string' && Types.ObjectId.isValid(val)) {
        payloadObj[key] = new Types.ObjectId(val);
      }
    }

    const payload: Partial<refunds> = payloadObj;
    if (!this.isAdmin(user)) {
      delete (payload as any).employeeId;
      delete (payload as any).financeStaffId;
      delete (payload as any).status;
      delete (payload as any).paidInPayrollRunId;
    }

    Object.assign(refund, payload);
    await refund.save();
    await refund.populate(['claimId', 'disputeId', 'employeeId', 'financeStaffId', 'paidInPayrollRunId']);
    return refund;
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    this.assertAdmin(user);
    const deleted = await this.refundModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Refund with id "${id}" not found`);
    }
  }

  /**
   * Create a pending refund tied to an approved claim.
   */
  async createFromClaim(claim: claims) {
    const claimId = (claim as any)._id ?? (claim as any).id ?? claim.claimId;
    const refund = new this.refundModel({
      claimId,
      refundDetails: {
        description: claim.description,
        amount: claim.approvedAmount ?? claim.amount,
      },
      employeeId: claim.employeeId,
      financeStaffId: claim.financeStaffId,
      status: RefundStatus.PENDING,
    });
    return refund.save();
  }

  /**
   * Create a pending refund tied to an approved dispute.
   */
  async createFromDispute(dispute: disputes, refundAmount?: number) {
    const disputeId =
      (dispute as any)._id ?? (dispute as any).id ?? dispute.disputeId;
    const refund = new this.refundModel({
      disputeId,
      refundDetails: {
        description: dispute.description,
        amount: refundAmount ?? 0,
      },
      employeeId: dispute.employeeId,
      financeStaffId: dispute.financeStaffId,
      status: RefundStatus.PENDING,
    });
    return refund.save();
  }

  /**
   * Apply all pending refunds to a payroll run by incrementing totalnetpay and marking refunds as paid.
   */
  async applyPendingRefunds(payrollRunId: string): Promise<number> {
    const pending = await this.refundModel
      .find({ status: RefundStatus.PENDING })
      .exec();

    let applied = 0;
    for (const refund of pending) {
      const amount = Number(refund.refundDetails?.amount ?? 0);
      if (Number.isFinite(amount) && amount !== 0) {
        await this.payrollRunModel
          .updateOne({ _id: payrollRunId }, { $inc: { totalnetpay: amount } })
          .exec();
      }

      refund.status = RefundStatus.PAID;
      refund.paidInPayrollRunId = new Types.ObjectId(payrollRunId);
      await refund.save();
      applied += 1;
    }

    return applied;
  }

  private getRoles(user: AuthUser): SystemRole[] {
    return [user.role, ...(user.roles ?? [])].filter(Boolean) as SystemRole[];
  }

  private isAdmin(user: AuthUser): boolean {
    return this.getRoles(user).includes(SystemRole.SYSTEM_ADMIN);
  }

  private assertSelfOrAdmin(
    refund: refundsDocument,
    user: AuthUser,
    action = 'access this refund',
  ): void {
    if (this.isAdmin(user)) return;

    if (refund.employeeId?.toString() !== user.employeeId) {
      throw new ForbiddenException(`You can only ${action}`);
    }
  }

  private assertAdmin(user: AuthUser): void {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Only admins can perform this action');
    }
  }
}
