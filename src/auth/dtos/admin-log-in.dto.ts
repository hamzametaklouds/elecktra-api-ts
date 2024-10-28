import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class AdminLoginDto {

    @ApiProperty({
        description: 'email string e.g email=550e8400-e29b-41d4-a716-446655440000',
        required: true,
        default: '',
    })
    @IsString()
    email: string;


    @ApiProperty({
        description: 'password string e.g password=550e8400-e29b-41d4-a716-446655440000',
        required: true,
        default: '',
    })
    @IsString()
    password: string;

}
