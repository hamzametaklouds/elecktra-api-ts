import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { OptionParentType, OptionSubType } from '../options.schema';

export class CreateOptionDto {

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
        description: 'icon string e.g icon=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    icon: string;

    @ApiProperty({
        description: 'parent_type string e.g parent_type=xyzabc',
        required: true,
        default: '',
    })
    @IsEnum(OptionParentType)
    parent_type: string;

    @ApiProperty({
        description: 'sub_type string e.g sub_type=xyzabc',
        required: true,
        default: '',
    })
    @IsEnum(OptionSubType)
    sub_type: string;


}
