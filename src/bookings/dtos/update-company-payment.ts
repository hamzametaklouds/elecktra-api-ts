import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CompanyPaymentStatus, ModifyClientBookingStatus } from '../bookings.schema';

export class UpdateCompanyPaymentDto {

    @ApiProperty({
        description: 'name string e.g name=xyzabc',
        required: true,
        default: '',
    })
    @IsEnum(CompanyPaymentStatus)
    @IsOptional()
    company_status: string;

    @ApiProperty({
        description: 'name string e.g name=xyzabc',
        required: true,
        default: '',
    })
    @IsEnum(ModifyClientBookingStatus)
    @IsOptional()
    booking_status: string;
}

