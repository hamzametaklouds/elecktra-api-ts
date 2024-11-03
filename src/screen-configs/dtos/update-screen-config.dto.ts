import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ScreenType } from '../screen-configs.schema';

export class UpdateScreenConfigDto {

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
        description: 'type string e.g type=xyzabc',
        required: true,
        default: ScreenType.O,
    })
    @IsString()
    @IsEnum(ScreenType)
    @IsOptional()
    type: string;

    @ApiProperty({
        description: 'images string e.g images=xyzabc',
        required: true,
        default: [''],
    })
    @IsArray()
    @IsOptional()
    images: string[];

    @ApiProperty({
        description: 'order_number number e.g order_number=9',
        required: true,
        default: 0,
    })
    @IsNumber()
    @IsOptional()
    order_number: number;

    @ApiProperty({
        description: 'is_deleted boolean e.g is_deleted=true',
        required: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    is_deleted?: boolean;
}
