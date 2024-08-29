import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.getUserByEmail(email);

    if (!user) {
      return { status: false, statusCode: 404, message: 'Invalid Credentials, please try again!', user: null }
    }



    const passwordCorrect = await bcrypt.compare(pass, user.password);

    if (!passwordCorrect) {
      return {
        status: false, statusCode: 400, message: 'Invalid Credentials, please try again!', user: null
      };
    }

    if (!user.email_verified) {
      const { password, ...result } = user;
      return { status: true, statusCode: 400, message: 'Email not verified', user: result }
    }

    if (user.is_disabled) {
      return { status: false, statusCode: 403, message: 'We are sorry, but your account has been temporarily blocked. Please contact our customer support team for further assistance', user: null }
    }

    if (passwordCorrect) {
      const { password, ...result } = user;
      const payload = { username: user.first_name, sub: user._id };
      return {
        status: true, statusCode: 200, access_token: this.jwtService.sign(payload), message: 'Login Successfully', user: result
      };
    }


  }

  async forgotPassword(email: string): Promise<any> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      return { status: false, statusCode: 404, message: 'Email not found', data: null }
    }

    if (!user.email_verified) {
      return { status: false, statusCode: 400, message: 'The user is not verified try verifying the email', data: null }
    }


    return { status: true, statusCode: 201, message: 'Forgot password link sent successfully', data: null }
  }

  async signUser(user_name, user_id) {

    return await this.jwtService.sign({ username: user_name, sub: user_id })

  }
}
