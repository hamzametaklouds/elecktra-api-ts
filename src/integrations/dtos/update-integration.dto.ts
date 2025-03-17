import { PartialType } from '@nestjs/swagger';
import { CreateIntegrationDto } from './create-integration.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateIntegrationDto extends PartialType(CreateIntegrationDto) {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_disabled?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;
} 