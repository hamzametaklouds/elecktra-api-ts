import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleOAuthInitDto {
    @ApiProperty({
        description: 'URL to redirect to after successful authentication',
        required: true,
        example: 'https://yourdomain.com/dashboard'
    })
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    successRedirectUrl: string;
}