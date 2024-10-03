import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PlanCarTripDto {

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
