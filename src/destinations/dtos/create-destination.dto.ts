import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateDestinationDto {

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
        description: 'images string e.g images=xyzabc',
        required: true,
        default: [''],
    })
    @IsString({ each: true })
    images: string[];

    @ApiProperty({
        description: 'lat string e.g lat=xyzabc',
        required: true,
        default: '',
    })
    @IsNumber()
    lat: string;

    @ApiProperty({
        description: 'long string e.g long=xyzabc',
        required: true,
        default: '',
    })
    @IsNumber()
    long: string;


    @ApiProperty({
        description: 'is_popular boolean e.g is_popular=xyzabc',
        required: true,
        default: false,
    })
    @IsBoolean()
    is_popular: boolean;


}
