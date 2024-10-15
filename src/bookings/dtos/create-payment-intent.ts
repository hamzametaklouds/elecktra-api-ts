import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreatePaymentIntentDto {


    @ApiProperty({
        description: 'email string e.g email=xyzabc',
        required: true,
        default: 'xyz@gmail.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'payment_intent string e.g payment_intent=pi_3Q9vyzRqUKwvYaK61zRM9THH',
        required: true,
        default: 'pi_3Q9vyzRqUKwvYaK61zRM9THH',
    })
    @IsString()
    payment_intent: string;

}