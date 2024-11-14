import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CompanyPaymentStatus } from '../bookings.schema';

export class UpdateCompanyPaymentDto {

    @ApiProperty({
        description: 'name string e.g name=xyzabc',
        required: true,
        default: '',
    })
    @IsEnum(CompanyPaymentStatus)
    company_status: string;
}

