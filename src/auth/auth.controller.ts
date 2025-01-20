import { Body, Controller, Post, UnauthorizedException, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/app/filters/http-exception.filter';
import { AuthService } from './auth.service';
import { SignUpUserDto } from './dtos/sign-up.dto';
import { GoogleLoginDto } from './dtos/google-log-in.dto';
import { LoginDto } from './dtos/log-in.dto';
import { AdminLoginDto } from './dtos/admin-log-in.dto';
import { CreateHostUserDto } from '../users/dtos/create-host-user.dto';
import { AppleLoginDto } from './dtos/apple-log-in';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password';


UseFilters(HttpExceptionFilter);
@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

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
        const createAuth = await this.authService.validateUser(body.uuid);
        return createAuth;
    }

    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiBody({ type: AppleLoginDto })
    @Post('apple-login')
    async loginWithApple(@Body() body: AppleLoginDto) {


        const customToken = await this.authService.verifyAndAuthenticate(body.id_token);
        return customToken
    }

    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @Post('guest/log-in')
    async guestLogin() {
        const createAuth = await this.authService.validateGuestUser();
        return createAuth;
    }

    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiBody({ type: AdminLoginDto })
    @Post('admin/log-in')
    async loginSystemUser(@Body() body: AdminLoginDto) {
        const createAuth = await this.authService.validateSystemUser(body.email, body.password);
        return createAuth;
    }

    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiBody({ type: GoogleLoginDto })
    @Post('google/log-in')
    async googleLogin(@Body() body: GoogleLoginDto) {
        const createAuth = await this.authService.googleLoginUser(body);
        return createAuth;
    }

    /**
     * 
     * @param body 
     * @returns 
     */
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiBody({ type: SignUpUserDto })
    @Post('sign-up')
    async signup(@Body() body: SignUpUserDto) {
        const createAuth = await this.authService.signUpUser(body);
        return { message: 'User signed up successfully', data: createAuth };
    }

    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiBody({ type: CreateHostUserDto })
    @Post('join-us')
    async joinUs(@Body() body: CreateHostUserDto) {
        const createAuth = await this.authService.joinUser(body);
        return { message: 'User joined successfully', data: createAuth };
    }

    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiBody({ type: ForgotPasswordDto })
    @Post('forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordDto) {
        const createAuth = await this.authService.forgetPassword(body);
        return { message: 'User joined successfully', data: createAuth };
    }


    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiBody({ type: ResetPasswordDto })
    @Post('reset-password')
    async resetPassword(@Body() body: ResetPasswordDto) {
        const createAuth = await this.authService.resetPassword(body);
        return { message: 'User joined successfully', data: createAuth };
    }




}
