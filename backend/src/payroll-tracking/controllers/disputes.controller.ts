import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { DisputesService } from '../services/disputes.service';
import { CreateDisputeDto } from '../dtos/create-dispute.dto';
import { UpdateDisputeDto } from '../dtos/update-dispute.dto';
import { disputes } from '../models/disputes.schema';
import { ApproveDisputeDto } from '../dtos/approve-dispute.dto';
import { RejectDisputeDto } from '../dtos/reject-dispute.dto';
import { CurrentUser, JwtAuthGuard } from '../../auth';
import type { AuthUser } from '../../auth/auth-user.interface';
import { FinanceApproveDisputeDto } from '../dtos/finance-approve-dispute.dto';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  create(
    @Body() createDisputeDto: CreateDisputeDto,
    @CurrentUser() user: AuthUser,
  ): Promise<disputes> {
    return this.disputesService.create(createDisputeDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser): Promise<disputes[]> {
    return this.disputesService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<disputes> {
    return this.disputesService.findOne(id, user);
  }

  @Get('by-dispute-id/:disputeId')
  findByClaimId(
    @Param('disputeId') disputeId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<disputes> {
    return this.disputesService.findByDisputeId(disputeId, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDisputeDto: UpdateDisputeDto,
    @CurrentUser() user: AuthUser,
  ): Promise<disputes> {
    return this.disputesService.update(id, updateDisputeDto, user);
  }

  @Post(':id/approve')
  approve(
    @Param('id') id: string,
    @Body() approveDisputeDto: ApproveDisputeDto,
    @CurrentUser() user: AuthUser,
  ): Promise<disputes> {
    return this.disputesService.approve(id, approveDisputeDto, user);
  }
  @Post(':id/finance-approve')
  financeApprove(
    @Param('id') id: string,
    @Body() dto: FinanceApproveDisputeDto,
    @CurrentUser() user: AuthUser,
  ): Promise<disputes> {
    return this.disputesService.financeApprove(id, dto, user);
  }

  @Post(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() rejectDisputeDto: RejectDisputeDto,
    @CurrentUser() user: AuthUser,
  ): Promise<disputes> {
    return this.disputesService.reject(id, rejectDisputeDto, user);
  }


  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser): Promise<void> {
    return this.disputesService.remove(id, user);
  }
}
