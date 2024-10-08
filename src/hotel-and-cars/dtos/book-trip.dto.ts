import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PlanTripDto {

    @ApiProperty({
        description: 'place_title string e.g place_title=xyzabc',
        required: true,
        default: 'Times Square',
    })
    @IsString()
    @IsOptional()
    place_title: string;

    @ApiProperty({
        description: 'address string e.g address=xyzabc',
        required: true,
        default: 'Times square new york city',
    })
    @IsString()
    @IsOptional()
    address: string;

    @ApiProperty({
        description: 'start_date string e.g start_date=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    start_date: string;

    @ApiProperty({
        description: 'end_date string e.g end_date=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    end_date: string;

    @ApiProperty({
        description: 'adults number e.g adults=xyzabc',
        required: true,
        default: 0,
    })
    @IsNumber()
    @IsNotEmpty()
    adults: number;

    @ApiProperty({
        description: 'children number e.g children=xyzabc',
        required: true,
        default: 0,
    })
    @IsNumber()
    children: number;

    @ApiProperty({
        description: 'infants number e.g infants=xyzabc',
        required: true,
        default: 0,
    })
    @IsNumber()
    infants: number;

    @ApiProperty({
        description: 'lat number e.g lat=2323',
        required: true,
        default: 0,
    })
    @IsNumber()
    lat: number;

    @ApiProperty({
        description: 'long number e.g long=2323',
        required: true,
        default: 0,
    })
    @IsNumber()
    long: number;


}
