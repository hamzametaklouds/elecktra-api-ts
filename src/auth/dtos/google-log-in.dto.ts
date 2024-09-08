import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class GoogleLoginDto {

    @ApiProperty({
        description: 'access_token string e.g access_token=550e8400-e29b-41d4-a716-446655440000',
        required: true,
        default: '',
    })
    @IsString()
    @IsNotEmpty()
    access_token: string;

}
