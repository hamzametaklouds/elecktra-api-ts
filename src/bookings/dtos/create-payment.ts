import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsNumber, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';


export class CreatePaymentDto {


    @ApiProperty({
        description: 'start_date string e.g start_date=xyzabc',
        required: true,
        default: 0,
    })
    @IsNumber()
    amount: number;

    @ApiProperty({
        description: 'end_date string e.g end_date=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    currency: string;

    @ApiProperty({
        description: 'email string e.g email=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    email: string;

    @ApiProperty({
        description: 'name string e.g name=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'booking_id string e.g booking_id=jknkjn54545jkj',
        required: true,
        default: '',
    })
    @IsMongoId()
    booking_id: ObjectId;


}

