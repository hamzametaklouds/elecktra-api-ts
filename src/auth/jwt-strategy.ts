import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SystemUsersService } from 'src/system-users/system-users.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private systemUserService: SystemUsersService,
    private userService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwtSecret.jwtSecret'),
    });
  }

  async validate(payload: any) {

    const userExists = await this.userService.getUserById(payload.sub)

    if (userExists) {
      return { userId: userExists._id, username: userExists.first_name };
    }

    const systemUserExists = await this.systemUserService.getUserById(payload?.sub)

    if (!systemUserExists) {
      throw new UnauthorizedException('Invalid Token')
    }

    return { userId: systemUserExists._id, username: systemUserExists.first_name, roles: systemUserExists.roles };



  }
}