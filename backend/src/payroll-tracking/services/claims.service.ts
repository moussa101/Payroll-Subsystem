import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { claims, claimsDocument } from '../models/claims.schema';
import { CreateClaimDto } from '../dtos/create-claim.dto';
import { UpdateClaimDto } from '../dtos/update-claim.dto';
import { ApproveClaimDto } from '../dtos/approve-claim.dto';
import { ClaimStatus } from '../enums/payroll-tracking-enum';
import { RefundsService } from './refunds.service';
import { RejectClaimDto } from '../dtos/reject-claim.dto';
import { AuthUser } from '../../auth/auth-user.interface';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
import { FinanceApproveClaimDto } from '../dtos/finance-approve-claim.dto';
import { FinanceNotificationsService } from '../notifications/finance-notifications.service';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectModel(claims.name)
    private readonly claimModel: Model<claimsDocument>,

    private readonly refundsService: RefundsService,
    private readonly notifications: FinanceNotificationsService,
  ) {}

  private pushHistory(
    claim: claimsDocument,
    status: string,
    note?: string,
  ) {
    claim.statusHistory = claim.statusHistory || [];
    claim.statusHistory.push({ status, at: new Date(), note });
  }

  async createExpense(createClaimDto: CreateClaimDto, user: AuthUser): Promise<claims> {
    return this.create({ ...createClaimDto, claimType: 'expense' }, user);
  }

  async findAllExpenses(user: AuthUser): Promise<claims[]> {
    const all = await this.findAll(user);
    return all.filter((c) => (c as any).claimType === 'expense' || !!c.expenseDetails);
  }

  async findOneExpense(id: string, user: AuthUser): Promise<claims> {
    const claim = await this.findOne(id, user);
    if ((claim as any).claimType !== 'expense' && !claim.expenseDetails) {
      throw new ForbiddenException('Not an expense claim');
    }
    return claim;
  }

  async updateExpense(id: string, dto: UpdateClaimDto, user: AuthUser): Promise<claims> {
    return this.update(id, { ...dto, claimType: 'expense' }, user);
  }

  async approveExpense(id: string, dto: ApproveClaimDto, user: AuthUser): Promise<claims> {
    return this.approve(id, dto, user);
  }

  async rejectExpense(id: string, dto: RejectClaimDto, user: AuthUser): Promise<claims> {
    return this.reject(id, dto, user);
  }

  async removeExpense(id: string, user: AuthUser): Promise<void> {
    return this.remove(id, user);
  }
  async create(createClaimDto: CreateClaimDto, user: AuthUser): Promise<claims> {
    const created = new this.claimModel({
      ...createClaimDto,
      employeeId: user.employeeId,
      financeStaffId: this.isPrivileged(user)
        ? createClaimDto.financeStaffId ?? undefined
        : undefined,
    });

    return created.save();
  }

  async findAll(user: AuthUser): Promise<claims[]> {
    const filter = this.isPrivileged(user) ? {} : { employeeId: user.employeeId };
    return this.claimModel
      .find(filter)
      .populate('employeeId')
      .populate('financeStaffId')
      .exec();
  }

  async findOne(id: string, user: AuthUser): Promise<claims> {
    const claim = await this.claimModel
      .findById(id)
      .populate('employeeId')
      .populate('financeStaffId')
      .exec();

    if (!claim) {
      throw new NotFoundException(`Claim with id "${id}" not found`);
    }

    this.assertSelfOrAdmin(claim, user);
    return claim;
  }

  // Optional: find by business claimId (CLAIM-0001)
  async findByClaimId(claimId: string, user: AuthUser): Promise<claims> {
    const claim = await this.claimModel
      .findOne({ claimId })
      .populate('employeeId')
      .populate('financeStaffId')
      .exec();

    if (!claim) {
      throw new NotFoundException(`Claim with claimId "${claimId}" not found`);
    }

    this.assertSelfOrAdmin(claim, user);
    return claim;
  }

  async update(id: string, updateClaimDto: UpdateClaimDto, user: AuthUser): Promise<claims> {
    const claim = await this.claimModel.findById(id).exec();

    if (!claim) {
      throw new NotFoundException(`Claim with id "${id}" not found`);
    }

    this.assertSelfOrAdmin(claim, user, 'update this claim');

    const updatePayload: Partial<claims> = { ...(updateClaimDto as unknown as Partial<claims>) };
    if (!this.isPrivileged(user)) {
      delete (updatePayload as any).employeeId;
      delete (updatePayload as any).financeStaffId;
      delete (updatePayload as any).status;
      delete (updatePayload as any).approvedAmount;
      delete (updatePayload as any).rejectionReason;
      delete (updatePayload as any).resolutionComment;
      delete (updatePayload as any).claimId;
    }

    Object.assign(claim, updatePayload);

    await claim.save();
    await claim.populate(['employeeId', 'financeStaffId']);
    return claim;
  }


  async approve(id: string, dto: ApproveClaimDto, user: AuthUser): Promise<claims> {
    const roles = this.getRoles(user);
    const isManagerLevel =
      roles.includes(SystemRole.PAYROLL_MANAGER) || roles.includes(SystemRole.SYSTEM_ADMIN);
    const isSpecialist = roles.includes(SystemRole.PAYROLL_SPECIALIST);
    if (!isManagerLevel && !isSpecialist) {
      throw new ForbiddenException('Only payroll specialists or managers can approve claims');
    }
    const claim = await this.claimModel.findById(id).exec();
    if (!claim) {
      throw new NotFoundException(`Claim with id "${id}" not found`);
    }

    if (isManagerLevel) {
      claim.status = ClaimStatus.PENDING_FINANCE_APPROVAL;
      if (dto.approvedAmount !== undefined) {
        claim.approvedAmount = dto.approvedAmount;
      }
      if (dto.resolutionComment) {
        claim.resolutionComment = dto.resolutionComment;
      }

      this.pushHistory(claim, ClaimStatus.PENDING_FINANCE_APPROVAL, dto.resolutionComment);
      await claim.save();
      this.notifications.emit({
        type: 'claim',
        id: claim._id?.toString() ?? '',
        businessId: claim.claimId,
        status: ClaimStatus.PENDING_FINANCE_APPROVAL,
        createdAt: new Date(),
      });
    } else {
      claim.status = ClaimStatus.PENDING_MANAGER_APPROVAL;
      if (dto.approvedAmount !== undefined) {
        claim.approvedAmount = dto.approvedAmount;
      }
      this.pushHistory(
        claim,
        ClaimStatus.PENDING_MANAGER_APPROVAL,
        dto.resolutionComment,
      );
      await claim.save();
    }

    return claim;
  }

  async financeApprove(id: string, dto: FinanceApproveClaimDto, user: AuthUser): Promise<claims> {
    const roles = this.getRoles(user);
    const isFinance =
      roles.includes(SystemRole.FINANCE_STAFF) || roles.includes(SystemRole.SYSTEM_ADMIN);
    if (!isFinance) {
      throw new ForbiddenException('Only finance staff can finance-approve claims');
    }
    const claim = await this.claimModel.findById(id).exec();
    if (!claim) {
      throw new NotFoundException(`Claim with id "${id}" not found`);
    }
    claim.status = ClaimStatus.APPROVED;
    if (dto.approvedAmount !== undefined) {
      claim.approvedAmount = dto.approvedAmount;
    }
    if (dto.financeNote) {
      claim.resolutionComment = [claim.resolutionComment, dto.financeNote]
        .filter(Boolean)
        .join(' | ');
    }
    this.pushHistory(claim, ClaimStatus.APPROVED, dto.financeNote);
    await claim.save();
    await this.refundsService.createFromClaim(claim);
    this.notifications.emit({
      type: 'claim',
      id: claim._id?.toString() ?? '',
      businessId: claim.claimId,
      status: ClaimStatus.APPROVED,
      createdAt: new Date(),
    });
    return claim;
  }

  async reject(id: string, dto: RejectClaimDto, user: AuthUser): Promise<claims> {
    this.assertPrivileged(user);
    const claim = await this.claimModel.findById(id).exec();
    if (!claim) {
      throw new NotFoundException(`Claim with id "${id}" not found`);
    }
    claim.status = ClaimStatus.REJECTED;
    if (dto.rejectionReason) {
      claim.rejectionReason = dto.rejectionReason;
    }
    this.pushHistory(claim, ClaimStatus.REJECTED, dto.rejectionReason);
    await claim.save();
    return claim;
  }
  async remove(id: string, user: AuthUser): Promise<void> {
    this.assertPrivileged(user);
    const result = await this.claimModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Claim with id "${id}" not found`);
    }
  }

  private getRoles(user: AuthUser): SystemRole[] {
    return [user.role, ...(user.roles ?? [])].filter(Boolean) as SystemRole[];
  }

  private isPrivileged(user: AuthUser): boolean {
    return this.getRoles(user).some((r) =>
      [
        SystemRole.SYSTEM_ADMIN,
        SystemRole.PAYROLL_SPECIALIST,
        SystemRole.PAYROLL_MANAGER,
        SystemRole.FINANCE_STAFF,
      ].includes(r),
    );
  }

  private assertSelfOrAdmin(
    claim: claimsDocument,
    user: AuthUser,
    action = 'access this claim',
  ): void {
    if (this.isPrivileged(user)) return;

    if (claim.employeeId?.toString() !== user.employeeId) {
      throw new ForbiddenException(`You can only ${action}`);
    }
  }

  private assertPrivileged(user: AuthUser): void {
    if (!this.isPrivileged(user)) {
      throw new ForbiddenException('Only payroll specialists, managers, finance staff, or admins can perform this action');
    }
  }
}
