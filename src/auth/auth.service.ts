import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpUserDto } from './dtos/sign-up.dto';
import { SystemUsersService } from 'src/system-users/system-users.service';
import admin from "firebase-admin"
import { GoogleLoginDto } from './dtos/google-log-in.dto';
import * as bcrypt from 'bcrypt'
import { CreateHostUserDto } from '../users/dtos/create-host-user.dto';
import { verifyIdToken } from 'apple-signin-auth';
import * as appleSigninAuth from 'apple-signin-auth';



@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private systemUsersService: SystemUsersService,
    private jwtService: JwtService,
  ) {   // Initialize Firebase Admin SDK
  }

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

  async verifyAndAuthenticate(idToken: string) {
    try {
      // Step 1: Verify the Apple ID token
      const applePayload = await appleSigninAuth.verifyIdToken(idToken, {
        audience: 'com.apps.voyageviteapp', // Replace with your Apple app's bundle ID
      });

      console.log(applePayload)

      const { sub: appleUserId, email } = applePayload;

      if (!appleUserId) {
        throw new UnauthorizedException('Invalid Apple ID token');
      }

      // Step 2: Check if user exists in Firebase
      let firebaseUser;
      try {

        const userExists = await this.usersService.getUserByEmail(email)

        if (userExists) {
          const user = await this.usersService.updateUserAppleId(userExists._id, appleUserId)

          return {
            access_token: this.jwtService.sign({ userName: user.first_name, sub: user._id }), message: 'Login Successful', user: userExists
          };

        }

        firebaseUser = await admin.auth().getUserByEmail(email);


        const fullName = firebaseUser?.displayName.split(" ")
        const firstName = fullName[0] || '-'
        const lastName = fullName[1] || '-'
        const em = firebaseUser?.email || '-'
        const uid = firebaseUser?.uuid || '-'


        const createdUser = await this.usersService.createGoogleUser({
          first_name: firstName,
          last_name: lastName,
          email: email,
          uuid: uid,
          apple_id: appleUserId,
          country_code: '-',
          phone_no: '-'
        })

        return {
          access_token: this.jwtService.sign({ userName: createdUser.first_name, sub: createdUser._id }), message: 'Login Successful', user: userExists
        };
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create a new Firebase user if not found
          firebaseUser = await admin.auth().createUser({
            uid: appleUserId,
            email,
            emailVerified: true,
          });
        } else {
          throw error;
        }
      }

      // Step 3: Generate a Firebase custom token for the user
      const customToken = await admin.auth().createCustomToken(firebaseUser.uid);

      return customToken;
    } catch (error) {
      console.error('Error in Apple login:', error);
      throw new UnauthorizedException('Authentication failed');
    }
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

    let userExists = await this.usersService.getUserByEmail(userRecordFirebase?.email)

    if (!userExists) {

      console.log('userRecordFirebase----', userRecordFirebase)

      const fullName = userRecordFirebase?.displayName?.split(" ") || null
      const firstName = fullName[0] || null
      const lastName = fullName[1] || null

      userExists = await this.usersService.createGoogleUser({
        first_name: firstName,
        last_name: lastName,
        email: userRecordFirebase?.email || null,
        uuid: userRecordFirebase?.uid || null,
        country_code: null,
        phone_no: userRecordFirebase?.phoneNumber ? userRecordFirebase?.phoneNumber : null
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
