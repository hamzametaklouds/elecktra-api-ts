import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateInvitationDto {

     
    @ApiProperty({
        description: 'is_deleted boolean e.g is_deleted=true',
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
