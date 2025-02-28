import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { ValidForType } from '../faq.schema';

export class CreateFaqDto {
    @ApiProperty({ description: 'Question text' })
    @IsString()
    question: string;

    @ApiProperty({ description: 'Answer text' })
    @IsString()
    answer: string;

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
    @IsString({ each: true })
    files?: string[];
} 