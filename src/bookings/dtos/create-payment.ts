import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
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
        description: 'payment_method_id string e.g payment_method_id=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    payment_method_id: string;

    @ApiProperty({
        description: 'save_payment string e.g save_payment=xyzabc',
        required: true,
        default: '',
    })
    @IsBoolean()
    @IsOptional()
    save_payment: boolean;

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

