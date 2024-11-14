import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateIdealCarDto {

    @ApiProperty({
        description: 'title string e.g title=raoarsalanlatif@gmail.com',
        required: true,
        default: '',
    })
    @IsString()
    title: string;


    @ApiProperty({
        description: 'images string e.g images=[]',
        required: false,
        default: [],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images: string[];

    @ApiProperty({
        description: 'address string e.g address=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    address: string;


    @ApiProperty({
        description: 'price number e.g price=676',
        required: true,
        default: 0,
    })
    @IsNumber()
    price: number;

    @ApiProperty({
        description: 'rating number e.g rating=676',
        required: true,
        default: 0,
    })
    @IsNumber()
    @IsOptional()
    rating: number;


    @ApiProperty({
        description: 'review number e.g review=676',
        required: true,
        default: 0,
    })
    @IsNumber()
    @IsOptional()
    reviews: number;

    @ApiProperty({
        description: 'car_details string e.g car_details=[{icon:,detail:}]',
        required: true,
        default:
        {
            year: 2000,
            seats: 0,
            mileage: '',
            fuel_type: '',
            transmission: '',
            duration_conditions: [{ detail: '', value: '' }],
            owner_rules: ''
        },
    })
    @IsOptional()
    car_details: object;









}
