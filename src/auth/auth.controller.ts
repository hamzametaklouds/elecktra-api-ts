import { Body, Controller, Post, UnauthorizedException, UseFilters, UsePipes, ValidationPipe, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/app/filters/http-exception.filter';
import { AuthService } from './auth.service';
import { SignUpUserDto } from './dtos/sign-up.dto';
import { GoogleLoginDto } from './dtos/google-log-in.dto';
import { LoginDto } from './dtos/log-in.dto';
import { AdminLoginDto } from './dtos/admin-log-in.dto';
import { AppleLoginDto } from './dtos/apple-log-in';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password';
import { RequestVerificationEmailDto } from './dtos/request-verification-email.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { AuthorizationHeader } from 'src/app/swagger.constant';
import { JWTAuthGuard } from './guards/jwt-auth-guard';
import { RolesGuard } from 'src/app/guards/role-guard';
import { Roles } from 'src/app/dtos/roles-decorator';
import { Role } from 'src/roles/roles.schema';


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
        const createAuth = await this.authService.validateUser(body.email, body.password);
        return createAuth;
    }

    // @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    // @ApiBody({ type: AppleLoginDto })
    // @Post('apple-login')
    // async loginWithApple(@Body() body: AppleLoginDto) {


    //     const customToken = await this.authService.verifyAndAuthenticate(body.id_token);
    //     return customToken
    // }

  

    // @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    // @ApiBody({ type: AdminLoginDto })
    // @Post('admin/log-in')
    // async loginSystemUser(@Body() body: AdminLoginDto) {
    //     const createAuth = await this.authService.validateSystemUser(body.email, body.password);
    //     return createAuth;
    // }

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
    @ApiBody({ type: ForgotPasswordDto })
    @Post('forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordDto) {
        const createAuth = await this.authService.forgetPassword(body);
        return { message: 'Link sent successfully', data: createAuth };
    }


    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiBody({ type: ResetPasswordDto })
    @Post('reset-password')
    async resetPassword(@Body() body: ResetPasswordDto) {
        const result = await this.authService.resetPassword(body);
        return { message: 'Password reset successfully', data: result };
    }

    @Get('verify-email/:token')
    async verifyEmail(@Param('token') token: string) {
        const result = await this.authService.verifyEmail(token);
        return { message: 'Email verified successfully', data: result };
    }

    @Post('request-verification-email')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiBody({ type: RequestVerificationEmailDto })
    async requestVerificationEmail(@Body() body: RequestVerificationEmailDto) {
        return await this.authService.requestVerificationEmail(body.email);
    }

    @Post('change-password')
    @ApiBearerAuth(AuthorizationHeader)
    @UseGuards(JWTAuthGuard, RolesGuard)
    @Roles(Role.BUSINESS_OWNER,Role.BUSINESS_ADMIN, Role.SUPPORT_ADMIN, Role.SUPER_ADMIN, Role.USER)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    @ApiBody({ type: ChangePasswordDto })
    async changePassword(@Body() body: ChangePasswordDto, @Request() req) {
        const result = await this.authService.changePassword(req.user, body);
        return { message: 'Password changed successfully', data: result };
    }
}
