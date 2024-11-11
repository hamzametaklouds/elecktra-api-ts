import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class UpdateIdealCarDto {

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
    @IsNotEmpty()
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
        description: 'price number e.g price=676',
        required: true,
        default: 0,
    })
    @IsNumber()
    @IsOptional()
    price: number;



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
        description: 'is_deleted boolean e.g is_deleted=xyzabc',
        required: true,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    is_disabled: boolean;


    @ApiProperty({
        description: 'is_deleted boolean e.g is_deleted=xyzabc',
        required: true,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    is_deleted: boolean;










}
