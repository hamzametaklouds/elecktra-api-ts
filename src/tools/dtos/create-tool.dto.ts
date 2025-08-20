import { IsString, IsBoolean, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ToolCategory {
  EMAIL = 'email',
  DOCS = 'docs',
  STORAGE = 'storage',
  SPREADSHEETS = 'spreadsheets',
  COMMUNICATION = 'communication',
  PRODUCTIVITY = 'productivity',
  OTHER = 'other'
}

export class CreateToolDto {
  @ApiProperty({
    description: 'Unique key identifier for the tool (lowercase)',
    required: true,
    example: 'gmail'
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: 'Display name of the tool',
    required: true,
    example: 'Gmail'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the tool',
    required: true,
    example: 'Google email service'
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Icon URL for the tool',
    required: false,
    example: 'https://example.com/gmail-icon.png'
  })
  @IsOptional()
  @IsString()
  icon_url?: string;

  @ApiProperty({
    description: 'Category of the tool',
    required: true,
    enum: ToolCategory,
    example: ToolCategory.EMAIL
  })
  @IsEnum(ToolCategory)
  category: string;

  @ApiProperty({
    description: 'Whether the tool is enabled',
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({
    description: 'OAuth type for authentication',
    required: false,
    example: 'oauth2'
  })
  @IsOptional()
  @IsString()
  oauth_type?: string;

  @ApiProperty({
    description: 'Required OAuth scopes',
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @ApiProperty({
    description: 'Configuration schema for the tool',
    required: false
  })
  @IsOptional()
  config_schema?: any;
}