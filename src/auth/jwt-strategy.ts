import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SystemUsersService } from 'src/system-users/system-users.service';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/roles/roles.schema';

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

    if (payload.sub === '67272691b1673e7c1353639a') {
      return { userId: '67272691b1673e7c1353639a', username: 'Guest' };
    }
    const userExists = await this.userService.getUserById(payload.sub);

    if (userExists) {
      return { userId: userExists._id, username: userExists.first_name, roles: [Role.USER] };
    }

    const systemUserExists = await this.systemUserService.getUserById(payload.sub);

    if (!systemUserExists) {
      throw new UnauthorizedException('Invalid Token');
    }

    // Define modules based on roles


    return {
      userId: systemUserExists._id,
      username: systemUserExists.first_name,
      roles: systemUserExists.roles,
    };
  }

}