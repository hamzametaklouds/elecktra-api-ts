import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateLandingPageConfigDto {

    @ApiProperty({
        description: 'hosts string e.g hosts=raoarsalanlatif@gmail.com',
        required: true,
        default: '',
    })
    @IsNumber()
    hosts: number;

    @ApiProperty({
        description: 'hosts string e.g hosts=raoarsalanlatif@gmail.com',
        required: true,
        default: '',
    })
    @IsNumber()
    cities: number;

    @ApiProperty({
        description: 'hosts string e.g hosts=raoarsalanlatif@gmail.com',
        required: true,
        default: '',
    })
    @IsNumber()
    app_downloads: number;



}
