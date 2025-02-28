import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsArray, IsOptional, Matches, ValidateIf } from 'class-validator';
import { ValidForType, FAQType } from '../faq.schema';

export class CreateFaqDto {
    @ApiProperty({ 
        description: 'Question text',
        required: false 
    })
    @IsOptional()
    @IsString()
    question?: string;

    @ApiProperty({ 
        description: 'Answer text',
        required: false 
    })
    @IsOptional()
    @IsString()
    answer?: string;

    @ApiProperty({ 
        enum: FAQType,
        description: 'Type of FAQ content',
        example: FAQType.TEXT
    })
    @IsEnum(FAQType)
    type: FAQType;

    @ApiProperty({ 
        enum: ValidForType,
        description: 'Target platform for FAQ',
        example: ValidForType.MOBILE
    })
    @IsEnum(ValidForType)
    valid_for: ValidForType;

    @ApiProperty({ 
        type: [String],
        required: false,
        description: 'Array of file URLs'
    })
    @IsOptional()
    @IsArray()
    @ValidateIf((o) => o.files && o.files.length > 0)
    @IsString({ each: true })
    @Matches(/^.*\.(pdf)$/i, { 
        each: true,
        message: 'All files must be PDFs',
        groups: ['pdf']
    })
    @Matches(/^.*\.(mp4|mov|avi|wmv|flv|mkv)$/i, { 
        each: true,
        message: 'All files must be videos',
        groups: ['video']
    })
    files?: string[];
} 