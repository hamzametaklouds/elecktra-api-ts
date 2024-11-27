import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';// Update with the correct path to your enum
import { ActualBookingStatus, CompanyPaymentStatus } from '../bookings.schema';

export class CreateCompanyPaymentDto {

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
        description: 'Status of the booking',
        enum: ActualBookingStatus,
        required: false,
        default: ActualBookingStatus.P,
    })
    @IsOptional()
    @IsEnum(ActualBookingStatus)
    booking_status: ActualBookingStatus;

    @ApiProperty({
        description: 'Status of the booking',
        enum: ActualBookingStatus,
        required: false,
        default: CompanyPaymentStatus.P,
    })
    @IsOptional()
    @IsEnum(CompanyPaymentStatus)
    company_payment: ActualBookingStatus;
}