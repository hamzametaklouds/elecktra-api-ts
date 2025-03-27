import { PartialType } from '@nestjs/swagger';
import { CreateIntegrationDto } from './create-integration.dto';
import { IsBoolean, IsOptional, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateIntegrationDto extends PartialType(CreateIntegrationDto) {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  api_key_required?: boolean;



  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_disabled?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;
} 