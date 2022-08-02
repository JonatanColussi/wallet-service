import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { jwtExpiresIn, jwtSecret } from '../../../constants';
import { UsersService } from '../../users/users.service';
import { AccessTokenPayload } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  public constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    });
  }

  async validate(payload: AccessTokenPayload) {
    const { sub: id } = payload;

    const user = await this.usersService.findOne(id);

    if (!user) {
      return null;
    }

    return user;
  }
}
