import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
    @ApiProperty({
        description: 'Google OAuth access token',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    access_token: string;

    @ApiProperty({
        description: 'Google user ID (sub)',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    sub: string;

    @ApiProperty({
        description: 'User email',
        required: true,
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'User full name',
        required: false,
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'User family name',
        required: false,
    })
    @IsString()
    @IsOptional()
    family_name?: string;

    @ApiProperty({
        description: 'User given name',
        required: false,
    })
    @IsString()
    @IsOptional()
    given_name?: string;

    @ApiProperty({
        description: 'User profile picture URL',
        required: false,
    })
    @IsString()
    @IsOptional()
    picture?: string;

}
