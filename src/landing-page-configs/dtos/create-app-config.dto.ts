import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional } from 'class-validator';

export class CreateOrUpdateAppConfigDto {
  @ApiProperty({
    description: 'Welcome slides array',
    required: true,
    type: [String],
    example: ['slide1.jpg', 'slide2.jpg'],
  })
  @IsArray()
  welcome_slides: string[];

  @ApiProperty({
    description: 'Is the configuration disabled?',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is_disabled?: boolean;

  @ApiProperty({
    description: 'Is the configuration deleted?',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;
}
