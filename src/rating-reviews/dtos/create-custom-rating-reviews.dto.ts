import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { UserType } from '../rating-reviews.schema';

export class CreateCustomRatingReviewDto {

    @ApiProperty({
        description: 'review string e.g review=jknkjn54545jkj',
        required: true,
        default: '',
    })
    @IsString()
    review: string;

    @ApiProperty({
        description: 'rating string e.g rating=0',
        required: true,
        default: '',
    })
    @IsNumber()
    rating: number;

    @ApiProperty({
        description: 'review string e.g review=jknkjn54545jkj',
        required: true,
        default: '',
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'review string e.g review=jknkjn54545jkj',
        required: true,
        default: '',
    })
    @IsString()
    image: string;

    @ApiProperty({
        description: 'review string e.g review=jknkjn54545jkj',
        required: true,
        default: '',
    })
    @IsString()
    designation: string;

    @ApiProperty({
        description: 'review string e.g review=jknkjn54545jkj',
        required: true,
        default: '',
    })
    @IsEnum(UserType)
    user_type: string;



}

