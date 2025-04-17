import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwtSecret.jwtSecret'),
    });
  }

  async validate(payload: any) {
    console.log(payload)
    
    const userExists = await this.userService.getUserByIdForAuth(payload.sub);

    if (!userExists) {
      throw new UnauthorizedException('Invalid Token');
    }

    if (userExists.is_disabled) {
      throw new UnauthorizedException('Restricted Access');
    }

    // Check if user has a company and if it's disabled
    if (userExists.company_id && userExists?.company?.is_disabled) {
      throw new UnauthorizedException('Restricted Access');
    }

    return {
      userId: userExists._id,
      username: userExists.first_name,
      roles: userExists.roles,
      company_id: userExists?.company_id || null,
    };
  }
}