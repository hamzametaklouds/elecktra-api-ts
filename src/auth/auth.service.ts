import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpUserDto } from './dtos/sign-up.dto';
import { SystemUsersService } from 'src/system-users/system-users.service';
import admin from "firebase-admin"
import { GoogleLoginDto } from './dtos/google-log-in.dto';
import * as bcrypt from 'bcrypt'
import { CreateHostUserDto } from '../users/dtos/create-host-user.dto';




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
      throw new NotFoundException('User not found')
    }

    if (user.is_disabled) {
      throw new ForbiddenException('We are sorry, but your account has been temporarily blocked. Please contact our customer support team for further assistance')

    }

    return {
      access_token: this.jwtService.sign({ userName: user.first_name, sub: user._id }), message: 'Login Successful', user: user
    };

  }

  async validateGuestUser() {


    return {
      access_token: this.jwtService.sign({ userName: 'Guest', sub: '67272691b1673e7c1353639a' }), message: 'Login Successful', user: { _id: '66d065e1guest0339427e4f8', first_name: 'Guest User' }
    };

  }

  async validateSystemUser(email: string, pass: string): Promise<any> {

    const user = await this.systemUsersService.getUserByEmail(email.toLocaleLowerCase());

    console.log(user)

    if (!user) {
      throw new BadRequestException('Invalid Credentials')
    }

    const passwordCorrect = await bcrypt.compare(pass, user.password);

    if (!passwordCorrect) {
      throw new BadRequestException('Invalid Credentials')
    }

    if (user.is_disabled) {
      throw new BadRequestException('Restricted User')
    }

    const modules = [];

    if (user.roles.includes('super_admin')) {
      modules.push(
        { title: 'Dashboard', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        { title: 'Role Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        { title: 'Company Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        { title: 'End User Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        { title: 'App Configuration', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        { title: 'Listing Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        { title: 'Booking Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        //{ title: 'Payment Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        { title: 'Landing Page Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        { title: 'Queries', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        { title: 'Host Requests', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        { title: 'Invitations', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
      );
    } else if (user.roles.includes('internal_admin')) {
      modules.push(
        { title: 'Dashboard', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' }
        ,
        { title: 'Company Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        { title: 'End User Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        // { title: 'App Configuration', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        { title: 'Listing Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        { title: 'Booking Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        // { title: 'Payment Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        { title: 'Queries', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        { title: 'Host Requests', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        //{ title: 'Invitations', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
      );
    } else if (user.roles.includes('company_admin')) {
      modules.push(
        { title: 'Dashboard', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' }
        ,
        { title: 'Listing Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        { title: 'Booking Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
        // { title: 'Payment Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
      );
    }

    user['modules'] = modules

    if (passwordCorrect) {
      const { password, ...result } = user;

      const payload = { username: user.first_name, sub: user._id, roles: user.roles };
      return {
        status: true, statusCode: 200, access_token: this.jwtService.sign(payload), message: 'Login Successful', user: result
      };
    }


  }

  async googleLoginUser(body: GoogleLoginDto): Promise<any> {

    const decodedToken = await admin.auth().verifyIdToken(body.access_token)

    const userRecordFirebase = await admin.auth().getUser(decodedToken.uid)

    if (!userRecordFirebase) {
      throw new BadRequestException('Invalid token')
    }

    let userExists = await this.usersService.getUserByEmail(userRecordFirebase.email)

    if (!userExists) {

      const fullName = userRecordFirebase.displayName.split(" ")
      const firstName = fullName[0]
      const lastName = fullName[1]

      userExists = await this.usersService.createGoogleUser({
        first_name: firstName,
        last_name: lastName,
        email: userRecordFirebase.email,
        uuid: userRecordFirebase.uid,
        country_code: null,
        phone_no: userRecordFirebase.phoneNumber ? userRecordFirebase.phoneNumber : null
      })

    }

    if (userExists.is_disabled) {
      throw new ForbiddenException('We are sorry, but your account has been temporarily blocked. Please contact our customer support team for further assistance')
    }

    return {
      access_token: this.jwtService.sign({ userName: userExists.first_name, sub: userExists._id }), message: 'Login Successful', user: userExists
    };

  }


  async signUpUser(body: SignUpUserDto) {

    const user = await this.usersService.insertUser(body)

    const access_token = await this.jwtService.sign({ userName: user.first_name, sub: user._id })

    return { access_token: access_token, user: user }

  }

  async joinUser(body: CreateHostUserDto) {

    const user = await this.usersService.joinUser(body)

    return { user: user }

  }
}
