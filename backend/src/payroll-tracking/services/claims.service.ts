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

@Injectable()
export class ClaimsService {
  constructor(
    @InjectModel(claims.name)
    private readonly claimModel: Model<claimsDocument>,

    private readonly refundsService: RefundsService,
  ) {}

  private pushHistory(
    claim: claimsDocument,
    status: string,
    note?: string,
  ) {
    claim.statusHistory = claim.statusHistory || [];
    claim.statusHistory.push({ status, at: new Date(), note });
  }
  async create(createClaimDto: CreateClaimDto, user: AuthUser): Promise<claims> {
    const created = new this.claimModel({
      ...createClaimDto,
      employeeId: user.employeeId,
      financeStaffId: this.isAdmin(user) ? createClaimDto.financeStaffId ?? undefined : undefined,
    });

    return created.save();
  }

  async findAll(user: AuthUser): Promise<claims[]> {
    const filter = this.isAdmin(user) ? {} : { employeeId: user.employeeId };
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
    if (!this.isAdmin(user)) {
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
    this.assertAdmin(user);
    const claim = await this.claimModel.findById(id).exec();
    if (!claim) {
      throw new NotFoundException(`Claim with id "${id}" not found`);
    }

    claim.status = ClaimStatus.APPROVED;
    if (dto.approvedAmount !== undefined) {
      claim.approvedAmount = dto.approvedAmount;
    }
    if (dto.resolutionComment) {
      claim.resolutionComment = dto.resolutionComment;
    }

    this.pushHistory(claim, ClaimStatus.APPROVED, dto.resolutionComment);

    await claim.save();

    await this.refundsService.createFromClaim(claim);

    return claim;
  }

  async reject(id: string, dto: RejectClaimDto, user: AuthUser): Promise<claims> {
    this.assertAdmin(user);
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
    this.assertAdmin(user);
    const result = await this.claimModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Claim with id "${id}" not found`);
    }
  }

  private getRoles(user: AuthUser): SystemRole[] {
    return [user.role, ...(user.roles ?? [])].filter(Boolean) as SystemRole[];
  }

  private isAdmin(user: AuthUser): boolean {
    return this.getRoles(user).includes(SystemRole.SYSTEM_ADMIN);
  }

  private assertSelfOrAdmin(
    claim: claimsDocument,
    user: AuthUser,
    action = 'access this claim',
  ): void {
    if (this.isAdmin(user)) return;

    if (claim.employeeId?.toString() !== user.employeeId) {
      throw new ForbiddenException(`You can only ${action}`);
    }
  }

  private assertAdmin(user: AuthUser): void {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Only admins can perform this action');
    }
  }
}
