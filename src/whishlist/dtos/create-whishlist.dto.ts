import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsNumber, IsString } from 'class-validator';

export class CreateWhishlistDto {

    @ApiProperty({
        description: 'hotel_or_car string e.g hotel_or_car=66d7270321521b8b510c9ef9',
        required: true,
        default: '',
    })
    @IsMongoId()
    hotel_or_car: string;

}
