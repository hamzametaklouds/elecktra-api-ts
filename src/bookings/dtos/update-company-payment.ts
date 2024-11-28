import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ActualBookingStatus, CompanyPaymentStatus, ModifyClientBookingStatus } from '../bookings.schema';

export class UpdateCompanyPaymentDto {

    @ApiProperty({
        description: 'name string e.g name=xyzabc',
        required: true,
        default: CompanyPaymentStatus.P,
    })
    @IsEnum(CompanyPaymentStatus)
    @IsOptional()
    company_payment: string;

    @ApiProperty({
        description: 'name string e.g name=xyzabc',
        required: true,
        default: ModifyClientBookingStatus.R,
    })
    @IsEnum(ModifyClientBookingStatus)
    @IsOptional()
    client_payment_status: string;

    @ApiProperty({
        description: 'Amount of the payment',
        required: false,
        default: 0,
    })
    @IsOptional()
    @IsNumber()
    company_payment_amount: number;

    @ApiProperty({
        description: 'Comment or note about the payment',
        required: false,
        default: '',
    })
    @IsOptional()
    @IsString()
    company_payment_comment: string

    @ApiProperty({
        description: 'Comment or note about the payment',
        required: false,
        default: '2023-04-26T20:32:01.150+00:00',
    })
    @IsOptional()
    @IsString()
    company_payment_paid_on: string

    @ApiProperty({
        description: 'Status of the booking',
        enum: ActualBookingStatus,
        required: false,
        default: ActualBookingStatus.P,
    })
    @IsOptional()
    @IsEnum(ActualBookingStatus)
    booking_status: ActualBookingStatus;


}

