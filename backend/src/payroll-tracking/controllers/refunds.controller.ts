import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { RefundsService } from '../services/refunds.service';
import { CreateRefundDto } from '../dtos/create-refund.dto';
import { UpdateRefundDto } from '../dtos/update-refund.dto';
import { refunds } from '../models/refunds.schema';
import { CurrentUser, JwtAuthGuard } from '../../auth';
import type { AuthUser } from '../../auth/auth-user.interface';

@Controller('refunds')
@UseGuards(JwtAuthGuard)
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  create(
    @Body() createRefundDto: CreateRefundDto,
    @CurrentUser() user: AuthUser,
  ): Promise<refunds> {
    return this.refundsService.create(createRefundDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser): Promise<refunds[]> {
    return this.refundsService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<refunds> {
    return this.refundsService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRefundDto: UpdateRefundDto,
    @CurrentUser() user: AuthUser,
  ): Promise<refunds> {
    return this.refundsService.update(id, updateRefundDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser): Promise<void> {
    return this.refundsService.remove(id, user);
  }
}
