import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { disputes, disputesDocument } from '../models/disputes.schema';
import { CreateDisputeDto } from '../dtos/create-dispute.dto';
import { UpdateDisputeDto } from '../dtos/update-dispute.dto';
import { ApproveDisputeDto } from '../dtos/approve-dispute.dto';
import { RefundsService } from './refunds.service';
import { DisputeStatus } from '../enums/payroll-tracking-enum';
import { RejectDisputeDto } from '../dtos/reject-dispute.dto';

@Injectable()
export class DisputesService {
  constructor(
    @InjectModel(disputes.name)
    private readonly disputeModel: Model<disputesDocument>,
    private readonly refundsService: RefundsService,
  ) {}

  private pushHistory(
    dispute: disputesDocument,
    status: string,
    note?: string,
  ) {
    dispute.statusHistory = dispute.statusHistory || [];
    dispute.statusHistory.push({ status, at: new Date(), note });
  }


  async create(createDisputeDto: CreateDisputeDto): Promise<disputes> {
    const dispute = new this.disputeModel(createDisputeDto);
    return dispute.save();
  }

  async findAll(): Promise<disputes[]> {
    return this.disputeModel
      .find()
      .populate('employeeId')
      .populate('financeStaffId')
      .populate('payslipId')
      .exec();
  }

  async findOne(id: string): Promise<disputes> {
    const dispute = await this.disputeModel
      .findById(id)
      .populate('employeeId')
      .populate('financeStaffId')
      .populate('payslipId')
      .exec();

    if (!dispute) {
      throw new NotFoundException(`Dispute with id "${id}" not found`);
    }

    return dispute;
  }

  async findByDisputeId(disputeId: string): Promise<disputes> {
    const dispute = await this.disputeModel
      .findOne({ disputeId })
      .populate('employeeId')
      .populate('financeStaffId')
      .populate('payslipId')
      .exec();

    if (!dispute) {
      throw new NotFoundException(`Dispute with disputeId "${disputeId}" not found`);
    }

    return dispute;
  }

  async update(id: string, updateDisputeDto: UpdateDisputeDto): Promise<disputes> {
    const updated = await this.disputeModel
      .findByIdAndUpdate(id, { $set: updateDisputeDto }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Dispute with id "${id}" not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.disputeModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Dispute with id "${id}" not found`);
    }
  }


  async approve(id: string, dto: ApproveDisputeDto): Promise<disputes> {
    const dispute = await this.disputeModel.findById(id).exec();
    if (!dispute) {
      throw new NotFoundException(`Dispute with id "${id}" not found`);
    }

    dispute.status = DisputeStatus.APPROVED;
    if (dto.resolutionComment) {
      dispute.resolutionComment = dto.resolutionComment;
    }

    this.pushHistory(dispute, DisputeStatus.APPROVED, dto.resolutionComment);

    await dispute.save();

    await this.refundsService.createFromDispute(dispute, dto.refundAmount);

    return dispute;
  }

  async reject(id: string, dto: RejectDisputeDto): Promise<disputes> {
    const dispute = await this.disputeModel.findById(id).exec();
    if (!dispute) {
      throw new NotFoundException(`Dispute with id "${id}" not found`);
    }

    dispute.status = DisputeStatus.REJECTED;
    if (dto.rejectionReason) {
      dispute.rejectionReason = dto.rejectionReason;
    }
    this.pushHistory(dispute, DisputeStatus.REJECTED, dto.rejectionReason);
    await dispute.save();
    return dispute;
  }
}