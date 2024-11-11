import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateLandingPageConfigDto {

    @ApiProperty({
        description: 'hosts string e.g hosts=raoarsalanlatif@gmail.com',
        required: true,
        default: '',
    })
    @IsNumber()
    @IsOptional()
    hosts: number;

    @ApiProperty({
        description: 'hosts string e.g hosts=raoarsalanlatif@gmail.com',
        required: true,
        default: '',
    })
    @IsNumber()
    @IsOptional()
    cities: number;

    @ApiProperty({
        description: 'hosts string e.g hosts=raoarsalanlatif@gmail.com',
        required: true,
        default: '',
    })
    @IsNumber()
    @IsOptional()
    app_downloads: number;



}
