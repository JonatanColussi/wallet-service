/* eslint-disable class-methods-use-this */
import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

import { User } from '../../users/users.model';

@Injectable()
export class TwoFactorAuthenticationService {
  async generateTwoFactorAuthenticationSecret({ email }: Pick<User, 'email'>) {
    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(
      email,
      process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME || '',
      secret,
    );

    return {
      secret,
      qrcode: await toDataURL(otpauthUrl),
    };
  }

  public isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthenticationSecret,
    });
  }
}
