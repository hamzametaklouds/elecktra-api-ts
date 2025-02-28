import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsArray, IsOptional, Matches, ValidateIf, ValidateNested, IsNotEmpty } from 'class-validator';
import { ValidForType, FAQType } from '../faq.schema';
import { Type } from 'class-transformer';

class FileDto {
    @ApiProperty({
        description: 'Title of the file',
        example: 'User Guide'
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'URL of the file',
        example: 'https://example.com/file.pdf'
    })
    @IsString()
    @IsNotEmpty()
    url: string;
}

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
        type: [FileDto],
        required: false,
        description: 'Array of files with title and URL'
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FileDto)
    files?: FileDto[];
} 