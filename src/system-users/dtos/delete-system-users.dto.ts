import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteSystemUserDto {

  @ApiProperty({
    description: 'is_disabled boolean e.g is_disabled=true',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is_disabled?: boolean;

  @ApiProperty({
    description: 'is_deleted boolean e.g is_deleted=true',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;

}
