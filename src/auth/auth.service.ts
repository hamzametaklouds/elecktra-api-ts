import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { SignUpUserDto } from './dtos/sign-up.dto';
import { SystemUsersService } from 'src/system-users/system-users.service';



@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private systemUsersService: SystemUsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(uuid: string): Promise<any> {
    const user = await this.usersService.getUserByUUID(uuid);

    if (!user) {
      throw new BadRequestException('Invalid UUID')
    }

    if (user.is_disabled) {
      throw new ForbiddenException('We are sorry, but your account has been temporarily blocked. Please contact our customer support team for further assistance')

    }

    return {
      access_token: this.jwtService.sign({ userName: user.first_name, sub: user._id }), message: 'Login Successful', user: user
    };

  }

  async googleLoginUser(body: SignUpUserDto): Promise<any> {

    let user = await this.usersService.getUserByUUID(body.uuid);

    if (!user) {

      user = await this.usersService.insertUser(body)

    }


    if (user.is_disabled) {
      throw new ForbiddenException('We are sorry, but your account has been temporarily blocked. Please contact our customer support team for further assistance')

    }

    return {
      access_token: this.jwtService.sign({ userName: user.first_name, sub: user._id }), message: 'Login Successful', user: user
    };

  }


  async signUpUser(body: SignUpUserDto) {

    const user = await this.usersService.insertUser(body)

    const access_token = await this.jwtService.sign({ userName: user.first_name, sub: user._id })

    return { access_token: access_token, user: user }

  }
}
