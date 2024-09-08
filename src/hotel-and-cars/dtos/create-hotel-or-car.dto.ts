import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsMongoId, IsNumber, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { RecordType } from '../hotel-and-cars.schema';

export class CreateHotelAndCarDto {

    @ApiProperty({
        description: 'title string e.g title=raoarsalanlatif@gmail.com',
        required: true,
        default: '',
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'description string e.g description=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    description: string;

    @ApiProperty({
        description: 'images string e.g images=[]',
        required: false,
        default: [],
    })
    @IsArray()
    @IsString({ each: true })
    images: string[];

    @ApiProperty({
        description: 'address string e.g address=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    address: string;

    @ApiProperty({
        description: 'highlights string e.g highlights=[{icon:,detail:}]',
        required: true,
        default: [{ icon: '', detail: '' }],
    })
    @IsArray()
    highlights: object[];

    @ApiProperty({
        description: 'amenities string e.g amenities=xyzabc',
        required: true,
        default: [''],
    })
    @IsArray()
    @IsMongoId({ each: true })
    amenities: ObjectId[];

    @ApiProperty({
        description: 'car_options string e.g car_options=xyzabc',
        required: true,
        default: [''],
    })
    @IsArray()
    @IsMongoId({ each: true })
    car_options: ObjectId[];

    @ApiProperty({
        description: 'type string e.g type=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsEnum(RecordType)
    type: string;

    @ApiProperty({
        description: 'lat number e.g lat=676',
        required: true,
        default: 0,
    })
    @IsNumber()
    lat: number;

    @ApiProperty({
        description: 'lat number e.g lat=676',
        required: true,
        default: 0,
    })
    @IsNumber()
    long: number;

    @ApiProperty({
        description: 'price number e.g price=676',
        required: true,
        default: 0,
    })
    @IsNumber()
    price: number;

    @ApiProperty({
        description: 'total_rooms number e.g total_rooms=676',
        required: true,
        default: 0,
    })
    @IsNumber()
    total_rooms: number;

    @ApiProperty({
        description: 'rooms_reserved number e.g rooms_reserved=676',
        required: true,
        default: 0,
    })
    @IsNumber()
    rooms_reserved: number;

    @ApiProperty({
        description: 'rooms_reserved number e.g rooms_reserved=676',
        required: true,
        default: 0,
    })
    @IsString()
    availability_from: string;

    @ApiProperty({
        description: 'availability_till number e.g availability_till=676',
        required: true,
        default: 0,
    })
    @IsString()
    availability_till: string;


    @ApiProperty({
        description: 'host_or_owner number e.g host_or_owner=676',
        required: true,
        default: 0,
    })
    @IsMongoId()
    host_or_owner: ObjectId;

    @ApiProperty({
        description: 'car_details string e.g car_details=[{icon:,detail:}]',
        required: true,
        default: [
            {
                year: 2000,
                seats: 0,
                mileage: '',
                fuel_type: '',
                transmission: '',
                duration_conditions: [''],
                owner_rules: ''
            }],
    })
    @IsArray()
    car_details: object[];


    @ApiProperty({
        description: 'hotel_details string e.g hotel_details=[{icon:,detail:}]',
        required: true,
        default: [
            {
                cancellation_policy: '',
                ground_rules: '',
            }],
    })
    @IsArray()
    hotel_details: object[];

    @ApiProperty({
        description: 'is_available number e.g is_available=676',
        required: false,
        default: false,
    })
    @IsBoolean()
    is_available: boolean





}
