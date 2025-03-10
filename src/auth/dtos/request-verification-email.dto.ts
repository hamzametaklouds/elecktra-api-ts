import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestVerificationEmailDto {
    @ApiProperty({
        description: 'User email address',
        required: true,
        example: 'user@example.com'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;
} 