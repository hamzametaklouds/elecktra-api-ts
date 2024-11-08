import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserType } from '../rating-reviews.schema';

export class UpdateCustomRatingReviewDto {

    @ApiProperty({
        description: 'review string e.g review=jknkjn54545jkj',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    review: string;

    @ApiProperty({
        description: 'rating string e.g rating=0',
        required: true,
        default: '',
    })
    @IsNumber()
    @IsOptional()
    rating: number;

    @ApiProperty({
        description: 'review string e.g review=jknkjn54545jkj',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    name: string;

    @ApiProperty({
        description: 'review string e.g review=jknkjn54545jkj',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    image: string;

    @ApiProperty({
        description: 'review string e.g review=jknkjn54545jkj',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    designation: string;

    @ApiProperty({
        description: 'review string e.g review=jknkjn54545jkj',
        required: true,
        default: '',
    })
    @IsEnum(UserType)
    @IsOptional()
    user_type: string;

    @ApiProperty({
        description: 'is_disabled boolean e.g is_deleted=true',
        required: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    is_disabled?: boolean;


    @ApiProperty({
        description: 'is_deleted boolean e.g is_deleted=true',
        required: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    is_deleted?: boolean;



}

