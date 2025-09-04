import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongoose';


class PricingDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  installation_price?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  subscription_price: number;
}

export class CreateAgentDto {
  @ApiProperty()
  @IsString()
  title: string;


  @ApiProperty()
  @IsString()
  service_type: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  display_description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  assistant_id: string;


  @ApiProperty()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PricingDto)
  @IsOptional()
  pricing: PricingDto;


  @ApiProperty({
    description: 'Agent tags (max 5) - can be tag names (strings) or existing tag IDs',
    required: false,
    type: [String],
    example: ['EMAIL', 'AUTOMATION', 'PRODUCTIVITY', '60f7b3b3b3b3b3b3b3b3b3b3']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
} 