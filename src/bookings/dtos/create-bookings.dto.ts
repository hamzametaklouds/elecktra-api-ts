import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsNumber, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateBookingsDto {

    @ApiProperty({
        description: 'hotel_or_car string e.g hotel_or_car=jknkjn54545jkj',
        required: true,
        default: '',
    })
    @IsMongoId()
    hotel_or_car: ObjectId;

    @ApiProperty({
        description: 'start_date string e.g start_date=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    start_date: string;

    @ApiProperty({
        description: 'end_date string e.g end_date=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    end_date: string;

    @ApiProperty({
        description: 'adults number e.g adults=xyzabc',
        required: true,
        default: 0,
    })
    @IsNumber()
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


}
