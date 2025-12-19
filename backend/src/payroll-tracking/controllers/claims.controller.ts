import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ClaimsService } from '../services/claims.service';
import { CreateClaimDto } from '../dtos/create-claim.dto';
import { UpdateClaimDto } from '../dtos/update-claim.dto';
import { ApproveClaimDto } from '../dtos/approve-claim.dto';
import { RejectClaimDto } from '../dtos/reject-claim.dto';
import { claims } from '../models/claims.schema';
import { CurrentUser, JwtAuthGuard } from '../../auth';
import type { AuthUser } from '../../auth/auth-user.interface';

@Controller('claims')
@UseGuards(JwtAuthGuard)
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  create(
    @Body() createClaimDto: CreateClaimDto,
    @CurrentUser() user: AuthUser,
  ): Promise<claims> {
    return this.claimsService.create(createClaimDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser): Promise<claims[]> {
    return this.claimsService.findAll(user);
  }

  // Optional: GET /claims/by-claim-id/:claimId (business id)
  @Get('by-claim-id/:claimId')
  findByClaimId(
    @Param('claimId') claimId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<claims> {
    return this.claimsService.findByClaimId(claimId, user);
  }

  // GET /claims/:id (Mongo _id)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<claims> {
    return this.claimsService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClaimDto: UpdateClaimDto,
    @CurrentUser() user: AuthUser,
  ): Promise<claims> {
    return this.claimsService.update(id, updateClaimDto, user);
  }
  @Post(':id/approve')
  approve(
    @Param('id') id: string,
    @Body() approveClaimDto: ApproveClaimDto,
    @CurrentUser() user: AuthUser,
  ): Promise<claims> {
    return this.claimsService.approve(id, approveClaimDto, user);
  }
  @Post(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() rejectClaimDto: RejectClaimDto,
    @CurrentUser() user: AuthUser,
  ): Promise<claims> {
    return this.claimsService.reject(id, rejectClaimDto, user);
  }
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser): Promise<void> {
    return this.claimsService.remove(id, user);
  }
}
