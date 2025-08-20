import { ApiProperty } from '@nestjs/swagger';

export class ToolSummaryDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  icon_url: string;

  @ApiProperty()
  category: string;
}

export class InvitationSummaryDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  invitee_name?: string;

  @ApiProperty()
  invitation_status: string;

  @ApiProperty()
  created_at: Date;
}

export class AgentResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  display_description: string;

  @ApiProperty()
  service_type: string;

  @ApiProperty()
  assistant_id?: string;

  @ApiProperty()
  image?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  tags: string[];

  @ApiProperty()
  tools_count: number;

  @ApiProperty({ type: [ToolSummaryDto] })
  tools_selected_details?: ToolSummaryDto[];

  @ApiProperty({ type: [InvitationSummaryDto] })
  invitations?: InvitationSummaryDto[];

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}