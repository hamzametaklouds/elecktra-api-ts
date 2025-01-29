import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class WelcomeSlideDto {
    @ApiProperty({ description: 'Image URL', required: true })
    @IsString()
    image: string;

    @ApiProperty({ description: 'Title', required: true })
    @IsString()
    title: string;
}

export class CreateOrUpdateAppConfigDto {
    @ApiProperty({
        description: 'Welcome slides array',
        required: true,
        type: [WelcomeSlideDto],
        example: [
            { image: 'slide1.jpg', title: 'Welcome Slide 1' },
            { image: 'slide2.jpg', title: 'Welcome Slide 2' },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WelcomeSlideDto)
    welcome_slides: WelcomeSlideDto[];

}