import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpUserDto } from './dtos/sign-up.dto';
import { GoogleLoginDto } from './dtos/google-log-in.dto';
import * as bcrypt from 'bcrypt'
import * as appleSigninAuth from 'apple-signin-auth';
import { ResetPasswordDto } from './dtos/reset-password';
import { InvitationsService } from 'src/invitations/invitations.service';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ObjectId } from 'mongodb';
import * as admin from 'firebase-admin';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();


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
        if (!body.access_token) {
            throw new BadRequestException('Access token is required');
        }

        // Step 1: Verify Google Access Token
        const ticket = await client.getTokenInfo(body.access_token);
        
        // Step 2: Verify that the essential token info matches
        if (ticket.email !== body.email || ticket.sub !== body.sub) {
            throw new BadRequestException('Invalid token data');
        }

        // Step 3: Check if user exists in the application database
        let userExists = await this.usersService.getUserByEmail(body.email);

        // Step 4: If user doesn't exist, create new user
        if (!userExists) {
            // Determine first and last name from available data
            let firstName = '';
            let lastName = '';

            if (body.given_name) {
                firstName = body.given_name;
            } else if (body.name) {
                firstName = body.name.split(' ')[0];
            }

            if (body.family_name) {
                lastName = body.family_name;
            } else if (body.name && body.name.includes(' ')) {
                lastName = body.name.split(' ').slice(1).join(' ');
            }

            userExists = await this.usersService.createGoogleUser({
                first_name: firstName,
                last_name: lastName,
                email: body.email,
                uuid: body.sub,
                image: body.picture || '',
            });
        }

        // Step 5: Check if the user is disabled
        if (userExists.is_disabled) {
            throw new ForbiddenException('Your account has been temporarily blocked. Please contact support.');
        }

        // Step 6: Return JWT for authentication
        return {
            access_token: this.jwtService.sign({ 
                userName: userExists.first_name, 
                sub: userExists._id 
            }),
            message: 'Login Successful',
            user: userExists
        };
    } catch (err) {
        console.error(err);
        if (err instanceof BadRequestException || err instanceof ForbiddenException) {
            throw err;
        }
        throw new BadRequestException('Something went wrong with sign-in');
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
