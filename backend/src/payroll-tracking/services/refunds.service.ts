import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class RefundsService {
  constructor(
    @InjectModel(refunds.name)
    private readonly refundModel: Model<refundsDocument>,
    @InjectModel(payrollRuns.name)
    private readonly payrollRunModel: Model<payrollRunsDocument>,
  ) {}

  async create(createRefundDto: CreateRefundDto): Promise<refunds> {
    const refund = new this.refundModel(createRefundDto);
    return refund.save();
  }

  async findAll(): Promise<refunds[]> {
    return this.refundModel
      .find()
      .populate('claimId')
      .populate('disputeId')
      .populate('employeeId')
      .populate('financeStaffId')
      .populate('paidInPayrollRunId')
      .exec();
  }

  async findOne(id: string): Promise<refunds> {
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

    return refund;
  }

  async update(id: string, updateRefundDto: UpdateRefundDto): Promise<refunds> {
    const updated = await this.refundModel
      .findByIdAndUpdate(id, { $set: updateRefundDto }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Refund with id "${id}" not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
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
}
