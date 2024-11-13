import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { HotelType, RecordType } from '../hotel-and-cars.schema';

export class CreateHotelAndCarDto {

    @ApiProperty({
        description: 'title string e.g title=raoarsalanlatif@gmail.com',
        required: true,
        default: '',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'description string e.g description=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

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
        description: 'hotel_type string e.g hotel_type=xyzabc',
        required: true,
        default: '',
    })
    @IsEnum(HotelType)
    @IsOptional()
    hotel_type: string;

    @ApiProperty({
        description: 'highlights string e.g highlights=[{icon:,detail:}]',
        required: true,
        default: [{ icon: '', detail: '' }],
    })
    @IsArray()
    @IsOptional()
    highlights: object[];

    @ApiProperty({
        description: 'company_id string e.g company_id=[{icon:,detail:}]',
        required: true,
        default: [{ icon: '', detail: '' }],
    })
    @IsMongoId()
    company_id: ObjectId;

    @ApiProperty({
        description: 'amenities string e.g amenities=xyzabc',
        required: true,
        default: [''],
    })
    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    amenities: ObjectId[];

    @ApiProperty({
        description: 'car_options string e.g car_options=xyzabc',
        required: true,
        default: [''],
    })
    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
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
    @IsOptional()
    lat: number;

    @ApiProperty({
        description: 'lat number e.g lat=676',
        required: true,
        default: 0,
    })
    @IsNumber()
    @IsOptional()
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
    @IsOptional()
    total_rooms: number;

    @ApiProperty({
        description: 'rooms_reserved number e.g rooms_reserved=676',
        required: true,
        default: 0,
    })
    @IsNumber()
    @IsOptional()
    rooms_reserved: number;

    @ApiProperty({
        description: 'rooms_reserved number e.g rooms_reserved=676',
        required: true,
        default: 0,
    })
    @IsString()
    @IsOptional()
    availability_from: string;

    @ApiProperty({
        description: 'availability_till number e.g availability_till=676',
        required: true,
        default: 0,
    })
    @IsString()
    @IsOptional()
    availability_till: string;

    @ApiProperty({
        description: 'unavailability_calendar number e.g unavailability_calendar=676',
        required: true,
        default: ['2024-10-02T10:06:18.650+00:00'],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    unavailability_calendar: string[];


    @ApiProperty({
        description: 'host_or_owner number e.g host_or_owner=676',
        required: true,
        default: 0,
    })
    @IsMongoId()
    @IsOptional()
    host_or_owner: ObjectId;

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


    @ApiProperty({
        description: 'hotel_details string e.g hotel_details=[{icon:,detail:}]',
        required: true,
        default:
        {
            cancellation_policy: '',
            ground_rules: '',
        },
    })
    @IsOptional()
    hotel_details: object;






}
