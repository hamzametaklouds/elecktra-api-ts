import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpUserDto } from './dtos/sign-up.dto';
import admin from "firebase-admin"
import { GoogleLoginDto } from './dtos/google-log-in.dto';
import * as bcrypt from 'bcrypt'
import * as appleSigninAuth from 'apple-signin-auth';
import { ResetPasswordDto } from './dtos/reset-password';
import { InvitationsService } from 'src/invitations/invitations.service';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ObjectId } from 'mongodb';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private invitationsService: InvitationsService
  ) {   // Initialize Firebase Admin SDK
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.getUserByEmail(email.toLowerCase());

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // Check if password matches (assuming you're using bcrypt for password hashing)
    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect) {
      throw new BadRequestException('Invalid credentials');
    }

    if (user.is_disabled) {
      throw new ForbiddenException('We are sorry, but your account has been temporarily blocked. Please contact our customer support team for further assistance');
    }

    // Check if email is verified
    if (!user.email_verified) {
      throw new BadRequestException('Please verify your email before logging in');
    }

    // Remove sensitive data before sending response
    const { password: _, ...userWithoutPassword } = user;

    return {
      access_token: this.jwtService.sign({ userName: user.first_name, sub: user._id }), 
      message: 'Login Successful', 
      user: userWithoutPassword
    };
  }

  async verifyAndAuthenticate(idToken: string) {
    try {
      // Step 1: Verify the Apple ID token
      const applePayload = await appleSigninAuth.verifyIdToken(idToken, {
        audience: 'com.apps.electraapp', // Replace with your Apple app's bundle ID
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


 


  // async validateSystemUser(email: string, pass: string): Promise<any> {
  //   const user = await this.usersService.getUserByEmail(email.toLocaleLowerCase());

  //   if (!user) {
  //     throw new BadRequestException('Invalid Credentials')
  //   }

  //   const passwordCorrect = await bcrypt.compare(pass, user.password);

  //   if (!passwordCorrect) {
  //     throw new BadRequestException('Invalid Credentials')
  //   }

  //   if (user.is_disabled) {
  //     throw new BadRequestException('Restricted User')
  //   }

  //   // Add email verification check
  //   if (!user.email_verified) {
  //     throw new BadRequestException('Please verify your email before logging in')
  //   }

  //   const modules = [];

  //   if (user.roles.includes('super_admin')) {
  //     modules.push(
  //       { title: 'Dashboard', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'Role Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'Company Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'End User Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'App Configuration', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'Listing Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'Booking Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       //{ title: 'Payment Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'Landing Page Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'Queries', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'Host Requests', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'Invitations', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'Featured Cities', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //     );
  //   } else if (user.roles.includes('internal_admin')) {
  //     modules.push(
  //       { title: 'Dashboard', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' }
  //       ,
  //       { title: 'Company Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'End User Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       // { title: 'App Configuration', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'Listing Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'Booking Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       // { title: 'Payment Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'Queries', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'Host Requests', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       //{ title: 'Invitations', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //     );
  //   } else if (user.roles.includes('company_admin')) {
  //     modules.push(
  //       { title: 'Dashboard', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' }
  //       ,
  //       { title: 'Listing Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       { title: 'Booking Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //       // { title: 'Payment Management', icon: 'https://s3.amazonaws.com/staging.carnivalist-images/a53f32eb-7f8f-4914-bd36-8c38d673d151.png' },
  //     );
  //   }

  //   user['modules'] = modules

  //   if (passwordCorrect) {
  //     const { password, ...result } = user;

  //     const payload = { username: user.first_name, sub: user._id, roles: user.roles };
  //     return {
  //       status: true, statusCode: 200, access_token: this.jwtService.sign(payload), message: 'Login Successful', user: result
  //     };
  //   }


  // }

  async googleLoginUser(body: GoogleLoginDto): Promise<any> {

    try {

      const decodedToken = await admin.auth().verifyIdToken(body.access_token)

      const userRecordFirebase = await admin.auth().getUser(decodedToken.uid)

      if (!userRecordFirebase) {
        throw new BadRequestException('Invalid token')
      }

      let userExists = await this.usersService.getUserByEmail(userRecordFirebase?.email)

      if (!userExists) {

        console.log('userRecordFirebase----', userRecordFirebase)

        const fullName = userRecordFirebase?.displayName ? userRecordFirebase?.displayName : null
        const firstName = userRecordFirebase?.displayName ? userRecordFirebase?.displayName?.split(' ')[0] : 'Anonymous'
        const lastName = userRecordFirebase?.displayName ? userRecordFirebase?.displayName?.split(' ')[1] : 'User'

        userExists = await this.usersService.createGoogleUser({
          first_name: firstName || ' ',
          last_name: lastName || ' ',
          email: userRecordFirebase?.email || ' ',
          uuid: userRecordFirebase?.uid || ' ',
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
    catch (err) {
      console.error(err)

      throw new BadRequestException('Something went wrong with sign in ')
    }

  }


  async signUpUser(body: SignUpUserDto) {

    const user = await this.usersService.insertUser(body)
    return {user: user}

  }

  async forgetPassword(body: ForgotPasswordDto) {
    return await this.invitationsService.sendForgotPasswordEmail(body.email)
  }

  async resetPassword(body: ResetPasswordDto) {
    try {
      // Verify and decode the token
      const decoded = await this.jwtService.verify(body.token);

      console.log(decoded)


        // Get and verify the invitation
        const invitation = await this.invitationsService.getinvitationByLinkId(decoded.link_id);
        if (!invitation || invitation.is_used) {
          throw new BadRequestException('Invalid or expired reset password link');
        }
      
      // Get user from decoded email
      const user = await this.usersService.getUserByEmail(invitation.email);
      if (!user) {
        throw new BadRequestException('Invalid reset password link');
      }

    

      // Update password and mark invitation as used
      await this.usersService.updateUserPassword(user._id, body.password);
      await this.invitationsService.deleteInvitation(invitation._id);

      return { message: 'Password reset successfully' };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid reset password link');
      }
      throw error;
    }
  }

  async verifyEmail(token: string) {
    try {
      // Verify the token
      const decoded = await this.jwtService.verify(token);

      console.log(decoded)
      
      // Get the invitation using the link_id from token
      const invitation = await this.invitationsService.getinvitationByLinkId(decoded.link_id);
      
      if (!invitation) {
        throw new BadRequestException('Invalid or expired verification link');
      }

      if (invitation.is_used) {
        throw new BadRequestException('This verification link has already been used');
      }
      console.log(invitation)

      // Update the user's email verification status
      const user = await this.usersService.getUserByEmail(invitation.email);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Mark the user's email as verified
      await this.usersService.markEmailAsVerified(user._id);

      // Mark the invitation as used
      await this.invitationsService.updateInvitationUser(invitation._id);

      return { success: true };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid or expired verification link');
    }
  }

  async requestVerificationEmail(email: string) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
        throw new BadRequestException('User not found');
    }
    
    if (user.email_verified) {
        throw new BadRequestException('Email is already verified');
    }
    
    return await this.invitationsService.sendVerificationEmail(email);
  }

  async changePassword(user: { userId?: ObjectId} , body: ChangePasswordDto) {
    const userData = await this.usersService.getUserById(user.userId);
    if (!userData) {
        throw new NotFoundException('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(body.oldPassword, userData.password);
    if (!isOldPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
    }

    // Update password
    await this.usersService.updateUserPassword(userData._id, body.newPassword);
    return { success: true };
  }

}
