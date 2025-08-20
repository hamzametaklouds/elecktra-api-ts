import { IsOptional, IsMongoId, IsArray, ValidateNested } from 'class-validator';
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

export class UpdateAgentAssignmentDto {
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
}