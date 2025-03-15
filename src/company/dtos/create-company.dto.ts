import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, IsBoolean } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Company website URL',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({
    description: 'Company bio',
    required: false,
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    description: 'Company image URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'Whether the company is disabled',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is_disabled?: boolean;

  @ApiProperty({
    description: 'Whether the company is deleted',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;
} 