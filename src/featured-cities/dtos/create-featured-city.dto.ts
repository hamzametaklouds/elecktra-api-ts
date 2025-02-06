import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateFeaturedCityDto {
    @ApiProperty({
        description: 'City title',
        required: true,
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'City description',
        required: true,
    })
    @IsString()
    description: string;

    @ApiProperty({
        description: 'City address',
        required: true,
    })
    @IsString()
    address: string;

    @ApiProperty({
        description: 'City images',
        required: true,
    })
    @IsString({ each: true })
    images: string[];

    @ApiProperty({
        description: 'Latitude',
        required: true,
    })
    @IsNumber()
    lat: number;

    @ApiProperty({
        description: 'Longitude',
        required: true,
    })
    @IsNumber()
    long: number;
} 