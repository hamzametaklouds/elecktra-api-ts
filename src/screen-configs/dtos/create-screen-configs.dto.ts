import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';
import { ScreenType } from '../screen-configs.schema';

export class CreateScreenConfigDto {

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
    @IsArray()
    images: string[];

    @ApiProperty({
        description: 'type string e.g type=xyzabc',
        required: true,
        default: ScreenType.O,
    })
    @IsString()
    @IsEnum(ScreenType)
    type: string;

    @ApiProperty({
        description: 'order_number number e.g order_number=9',
        required: true,
        default: 0,
    })
    @IsNumber()
    order_number: number;
}
