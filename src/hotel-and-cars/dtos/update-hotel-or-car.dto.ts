import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { HotelType, RecordType } from '../hotel-and-cars.schema';
import { PlatformAccessStatus } from 'src/app/global-enums';

export class UpdateHotelAndCarDto {

    @ApiProperty({
        description: 'title string e.g title=raoarsalanlatif@gmail.com',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    title: string;

    @ApiProperty({
        description: 'description string e.g description=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
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
        description: 'highlights string e.g highlights=[{icon:,detail:}]',
        required: true,
        default: [{ icon: '', detail: '' }],
    })
    @IsArray()
    @IsOptional()
    highlights: object[];

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
    @IsOptional()
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
    @IsOptional()
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
        description: 'hotel_type string e.g hotel_type=xyzabc',
        required: true,
        default: '',
    })
    @IsEnum(HotelType)
    @IsOptional()
    hotel_type: string;

    @ApiProperty({
        description: 'platform_access_status string e.g platform_access_status=xyzabc',
        required: true,
        default: '',
    })
    @IsEnum(PlatformAccessStatus)
    @IsOptional()
    platform_access_status: string;

    @ApiProperty({
        description: 'check_in_time string e.g check_in_time=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    check_in_time: string;

    @ApiProperty({
        description: 'check_in_time string e.g check_in_time=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    check_out_time: string;


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
    @IsOptional()
    car_details: object[];


    @ApiProperty({
        description: 'hotel_details string e.g hotel_details=[{icon:,detail:}]',
        required: true,
        default:
        {
            cancellation_policy: '',
            cancellation_days: 0,
            ground_rules: '',
        },
    })
    @IsOptional()
    hotel_details: object;

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
        description: 'is_ideal number e.g is_ideal=676',
        required: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    is_ideal: boolean

    @ApiProperty({
        description: 'is_ideal number e.g is_ideal=676',
        required: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    is_deleted: boolean

    @ApiProperty({
        description: 'is_ideal number e.g is_ideal=676',
        required: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    is_disabled: boolean






}

export class UpdateHotelDetailsDto {
    @IsOptional()
    @IsString()
    cancellation_policy?: string;

    @IsOptional()
    @IsNumber()
    cancellation_days?: number;

    @IsOptional()
    @IsString()
    ground_rules?: string;
}
