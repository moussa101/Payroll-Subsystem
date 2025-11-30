import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateCompanySettingsDto {
  @IsDateString()
  @IsOptional()
  payDate?: Date;

  @IsString()
  @IsOptional()
  timeZone?: string;

  @IsString()
  @IsOptional()
  currency?: string;
}