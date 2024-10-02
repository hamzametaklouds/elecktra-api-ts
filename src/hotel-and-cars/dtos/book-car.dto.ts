import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PlanCarTripDto {

    @ApiProperty({
        description: 'when string e.g when=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    when: string;

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
