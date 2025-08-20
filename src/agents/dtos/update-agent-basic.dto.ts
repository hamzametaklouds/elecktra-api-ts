import { IsString, IsOptional, IsArray, MaxLength, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAgentBasicDto {
  @ApiProperty({
    description: 'Agent title',
    required: false,
    example: 'Email Assistant Agent'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Agent description',
    required: false,
    example: 'Helps manage and automate email tasks'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Display description for UI',
    required: false,
    example: 'This agent helps you manage emails efficiently'
  })
  @IsOptional()
  @IsString()
  display_description?: string;

  @ApiProperty({
    description: 'Service type',
    required: false,
    example: 'automation'
  })
  @IsOptional()
  @IsString()
  service_type?: string;

  @ApiProperty({
    description: 'Assistant ID for AI integration',
    required: false,
    example: 'asst_12345'
  })
  @IsOptional()
  @IsString()
  assistant_id?: string;

  @ApiProperty({
    description: 'Agent image URL',
    required: false,
    example: 'https://example.com/agent-image.png'
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    description: 'Agent tags (max 5)',
    required: false,
    type: [String],
    example: ['EMAIL', 'AUTOMATION', 'PRODUCTIVITY']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5, { message: 'Maximum 5 tags allowed' })
  tags?: string[];
}