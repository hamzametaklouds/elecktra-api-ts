import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateFaqDto } from './create-faq.dto';
import { IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdateFaqDto extends PartialType(CreateFaqDto) {
    @ApiProperty({ 
        required: false,
        description: 'Disable/Enable the FAQ'
    })
    @IsOptional()
    @IsBoolean()
    is_disabled?: boolean;

    @ApiProperty({ 
        required: false,
        description: 'Soft delete the FAQ'
    })
    @IsOptional()
    @IsBoolean()
    is_deleted?: boolean;


} 