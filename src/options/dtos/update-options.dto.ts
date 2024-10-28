import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { OptionParentType, OptionSubType } from '../options.schema';

export class UpdateOptionDto {

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
        description: 'icon string e.g icon=xyzabc',
        required: true,
        default: '',
    })
    @IsString()
    @IsOptional()
    icon: string;

    @ApiProperty({
        description: 'parent_type string e.g parent_type=xyzabc',
        required: true,
        default: '',
    })
    @IsEnum(OptionParentType)
    @IsOptional()
    parent_type: string;

    @ApiProperty({
        description: 'sub_type string e.g sub_type=xyzabc',
        required: true,
        default: '',
    })
    @IsEnum(OptionSubType)
    @IsOptional()
    sub_type: string;

    @ApiProperty({
        description: 'is_deleted boolean e.g is_deleted=true',
        required: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    is_deleted?: boolean;


}
