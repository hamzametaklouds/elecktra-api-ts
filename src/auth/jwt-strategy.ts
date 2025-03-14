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

  
    const userExists = await this.userService.getUserById(payload.sub);

    if (!userExists) {
      throw new UnauthorizedException('Invalid Token');
    }

    return {
      userId: userExists._id,
      username: userExists.first_name,
      role: userExists.roles[0],
      company_id: userExists?.company_id || null,
    };
  }

}