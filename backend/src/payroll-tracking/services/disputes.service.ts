import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { disputes, disputesDocument } from '../models/disputes.schema';
import { CreateDisputeDto } from '../dtos/create-dispute.dto';
import { UpdateDisputeDto } from '../dtos/update-dispute.dto';
import { ApproveDisputeDto } from '../dtos/approve-dispute.dto';
import { RefundsService } from './refunds.service';
import { DisputeStatus } from '../enums/payroll-tracking-enum';
import { RejectDisputeDto } from '../dtos/reject-dispute.dto';
import { AuthUser } from '../../auth/auth-user.interface';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

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


  async create(createDisputeDto: CreateDisputeDto, user: AuthUser): Promise<disputes> {
    const dispute = new this.disputeModel({
      ...createDisputeDto,
      employeeId: user.employeeId,
      financeStaffId: this.isAdmin(user) ? createDisputeDto.financeStaffId ?? undefined : undefined,
    });
    return dispute.save();
  }

  async findAll(user: AuthUser): Promise<disputes[]> {
    const filter = this.isAdmin(user) ? {} : { employeeId: user.employeeId };
    return this.disputeModel
      .find(filter)
      .populate('employeeId')
      .populate('financeStaffId')
      .populate('payslipId')
      .exec();
  }

  async findOne(id: string, user: AuthUser): Promise<disputes> {
    const dispute = await this.disputeModel
      .findById(id)
      .populate('employeeId')
      .populate('financeStaffId')
      .populate('payslipId')
      .exec();

    if (!dispute) {
      throw new NotFoundException(`Dispute with id "${id}" not found`);
    }

    this.assertSelfOrAdmin(dispute, user);
    return dispute;
  }

  async findByDisputeId(disputeId: string, user: AuthUser): Promise<disputes> {
    const dispute = await this.disputeModel
      .findOne({ disputeId })
      .populate('employeeId')
      .populate('financeStaffId')
      .populate('payslipId')
      .exec();

    if (!dispute) {
      throw new NotFoundException(`Dispute with disputeId "${disputeId}" not found`);
    }

    this.assertSelfOrAdmin(dispute, user);
    return dispute;
  }

  async update(id: string, updateDisputeDto: UpdateDisputeDto, user: AuthUser): Promise<disputes> {
    const dispute = await this.disputeModel.findById(id).exec();

    if (!dispute) {
      throw new NotFoundException(`Dispute with id "${id}" not found`);
    }

    this.assertSelfOrAdmin(dispute, user, 'update this dispute');

    const payload = { ...updateDisputeDto } as Partial<disputes>;
    if (!this.isAdmin(user)) {
      delete (payload as any).employeeId;
      delete (payload as any).financeStaffId;
      delete (payload as any).status;
      delete (payload as any).rejectionReason;
      delete (payload as any).resolutionComment;
      delete (payload as any).disputeId;
    }

    Object.assign(dispute, payload);
    await dispute.save();

    await dispute.populate(['employeeId', 'financeStaffId', 'payslipId']);
    return dispute;
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    this.assertAdmin(user);
    const deleted = await this.disputeModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Dispute with id "${id}" not found`);
    }
  }


  async approve(id: string, dto: ApproveDisputeDto, user: AuthUser): Promise<disputes> {
    this.assertAdmin(user);
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

  async reject(id: string, dto: RejectDisputeDto, user: AuthUser): Promise<disputes> {
    this.assertAdmin(user);
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

  private getRoles(user: AuthUser): SystemRole[] {
    return [user.role, ...(user.roles ?? [])].filter(Boolean) as SystemRole[];
  }

  private isAdmin(user: AuthUser): boolean {
    return this.getRoles(user).includes(SystemRole.SYSTEM_ADMIN);
  }

  private assertSelfOrAdmin(
    dispute: disputesDocument,
    user: AuthUser,
    action = 'access this dispute',
  ): void {
    if (this.isAdmin(user)) return;

    if (dispute.employeeId?.toString() !== user.employeeId) {
      throw new ForbiddenException(`You can only ${action}`);
    }
  }

  private assertAdmin(user: AuthUser): void {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Only admins can perform this action');
    }
  }
}
