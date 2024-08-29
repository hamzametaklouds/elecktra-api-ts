import { Body, Controller, Post, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/app/filters/http-exception.filter';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { LoginDto } from './dtos/log-in.dto';
import { JWTAuthGuard } from './guards/jwt-auth-guard';

UseFilters(HttpExceptionFilter);
@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    /**
   * The purpose of this method is to log in user
   * @param body receives the body of the type LoginDto that validates the post request
   * according to the rules defined in validation pipe i.e LoginDto
   * @returns the auth access token
   */
    //@UseGuards(JWTAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiBody({ type: LoginDto })
    @Post('log-in')
    async login(@Body() body: LoginDto) {
        const createAuth = await this.authService.validateUser(body.email,body.password);
        return createAuth;
    }

    /**
   * The purpose of this method is to log in user
   * @param body receives the body of the type LoginDto that validates the post request
   * according to the rules defined in validation pipe i.e LoginDto
   * @returns the auth access token
   */
    //@UseGuards(JWTAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiBody({ type: LoginDto })
    @Post('admin/log-in')
    async adminLogin(@Body() body: LoginDto) {
        const createAuth = await this.authService.validateUser(body.email,body.password);
        return createAuth;
    }

    

  /**
   * The purpose of this method is to reset the password via sending otp
   * @param body receives the body of the type LoginDto that validates the post request
   * according to the rules defined in validation pipe i.e LoginDto
   * @returns the auth access token
   */
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiBody({ type: ForgotPasswordDto })
    @Post('forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordDto) {
        const validatedEmail = await this.authService.forgotPassword(body.email);
        return validatedEmail;
    }
}
