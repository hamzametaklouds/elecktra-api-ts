import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class AppleLoginDto {

    @ApiProperty({
        description: 'id_token string e.g id_token=550e8400-e29b-41d4-a716-446655440000',
        required: true,
        default: '',
    })
    @IsString()
    id_token: string;

}
