// backend/src/payroll-configuration/dto/update-termination-benefit.dto.ts
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateTerminationBenefitDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  terms?: string;
}