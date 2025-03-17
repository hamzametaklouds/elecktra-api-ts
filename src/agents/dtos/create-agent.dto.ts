import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongoose';

class WorkflowDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_disabled?: boolean;

  @ApiProperty()
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  integrations?: ObjectId[];
}

class PricingDto {
  @ApiProperty()
  @IsNumber()
  installation_price: number;

  @ApiProperty()
  @IsNumber()
  subscription_price: number;
}

export class CreateAgentDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  sub_title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  display_description: string;

  @ApiProperty()
  @IsString()
  request_time_frame: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PricingDto)
  pricing: PricingDto;

  @ApiProperty({ type: [WorkflowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowDto)
  work_flows: WorkflowDto[];
} 