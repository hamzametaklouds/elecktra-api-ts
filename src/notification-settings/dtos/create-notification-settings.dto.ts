import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class CreateNotificationSettingsDto {
  @ApiProperty({
    description: 'Desktop notifications setting',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  desktop_notifications?: boolean;

  @ApiProperty({
    description: 'Purchase notifications setting',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  purchase_notifications?: boolean;

  @ApiProperty({
    description: 'All notifications setting',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  all_notifications?: boolean;
} 