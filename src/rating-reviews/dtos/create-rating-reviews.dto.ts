import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateRatingReviewDto {

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
        description: 'hotel_or_car string e.g hotel_or_car=xyzabc',
        required: true,
        default: '',
    })
    @IsMongoId()
    hotel_or_car: ObjectId;

    @ApiProperty({
        description: 'booking_id string e.g booking_id=xyzabc',
        required: true,
        default: '',
    })
    @IsMongoId()
    booking_id: ObjectId;


}

