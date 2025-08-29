import { IsString, IsOptional, IsArray, MaxLength, ArrayMaxSize, IsMongoId, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class InviteeDto {
  @ApiProperty({
    description: 'Invitee email address',
    required: true,
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'Invitee name',
    required: false,
    example: 'John Doe'
  })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Role to assign to invitee',
    required: true,
    example: 'USER'
  })
  role: string;
}

export class CreateAgentWizardDto {
  // Basic Information (Step 1)
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
    description: 'Agent tags (max 5) - can be tag names (strings) or existing tag IDs',
    required: false,
    type: [String],
    example: ['EMAIL', 'AUTOMATION', 'PRODUCTIVITY', '60f7b3b3b3b3b3b3b3b3b3b3']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5, { message: 'Maximum 5 tags allowed' })
  tags?: string[];

  // Tools Selection (Step 2)
  @ApiProperty({
    description: 'Array of selected tool IDs (max 24)',
    required: true,
    type: [String],
    example: ['60f7b3b3b3b3b3b3b3b3b3b3', '60f7b3b3b3b3b3b3b3b3b3b4']
  })
  @IsArray()
  @IsMongoId({ each: true })
  tools_selected: string[];

  // Assignment and Invitations (Step 3)
  @ApiProperty({
    description: 'Client ID to assign the agent to',
    required: false,
    example: '60f7b3b3b3b3b3b3b3b3b3b3'
  })
  @IsOptional()
  @IsMongoId()
  client_id?: string;

  @ApiProperty({
    description: 'Array of invitees to send invitations to',
    required: false,
    type: [InviteeDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InviteeDto)
  invitees?: InviteeDto[];

  // Integration Control (Step 4)
  @ApiProperty({
    description: 'Whether to automatically integrate/activate the agent after creation',
    required: false,
    default: false,
    example: true
  })
  @IsOptional()
  auto_integrate?: boolean;
}