import { ApiProperty } from '@nestjs/swagger';

export class NotificationSettingsResponseDto {
  @ApiProperty({
    description: 'Notification settings ID',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439012',
  })
  user_id: string;

  @ApiProperty({
    description: 'Desktop notifications setting',
    example: true,
  })
  desktop_notifications: boolean;

  @ApiProperty({
    description: 'Purchase notifications setting',
    example: true,
  })
  purchase_notifications: boolean;

  @ApiProperty({
    description: 'All notifications setting',
    example: true,
  })
  all_notifications: boolean;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updated_at: Date;
} 