import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateFeaturedCityDto {
    @ApiProperty({
        description: 'City title',
        required: false,
    })
    @IsString()
    @IsOptional()
    title: string;

    @ApiProperty({
        description: 'City description',
        required: false,
    })
    @IsString()
    @IsOptional()
    description: string;

    @ApiProperty({
        description: 'City address',
        required: false,
    })
    @IsString()
    @IsOptional()
    address: string;

    @ApiProperty({
        description: 'City images',
        required: false,
    })
    @IsString({ each: true })
    @IsOptional()
    images: string[];

    @ApiProperty({
        description: 'Latitude',
        required: false,
    })
    @IsNumber()
    @IsOptional()
    lat: number;

    @ApiProperty({
        description: 'Longitude',
        required: false,
    })
    @IsNumber()
    @IsOptional()
    long: number;

    @ApiProperty({
        description: 'Is disabled flag',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    is_disabled: boolean;

    @ApiProperty({
        description: 'Is deleted flag',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    is_deleted: boolean;
} 