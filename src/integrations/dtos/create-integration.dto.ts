import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateIntegrationDto {
  @ApiProperty()
  @IsString()
  title: string;


  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  api_key_required?: boolean;


} 