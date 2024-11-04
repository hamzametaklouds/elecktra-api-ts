import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDestinationDto {

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
        description: 'images string e.g images=xyzabc',
        required: true,
        default: [''],
    })
    @IsString({ each: true })
    @IsOptional()
    images: string[];

    @ApiProperty({
        description: 'lat string e.g lat=xyzabc',
        required: true,
        default: '',
    })
    @IsNumber()
    @IsOptional()
    lat: string;

    @ApiProperty({
        description: 'long string e.g long=xyzabc',
        required: true,
        default: '',
    })
    @IsNumber()
    @IsOptional()
    long: string;


    @ApiProperty({
        description: 'is_popular boolean e.g is_popular=xyzabc',
        required: true,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    is_popular: boolean;


}
