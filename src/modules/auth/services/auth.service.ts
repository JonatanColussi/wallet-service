import { BadRequestException, Injectable } from '@nestjs/common';

import { TokensService } from './tokens.service';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';

import { UsersService } from '../../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly tokensService: TokensService,
  ) {}

  async login(username: string, password: string, otp: string) {
    const user = await this.usersService.get({ username });

    const usernameIsValid = !!user;
    const [passwordIsValid, otpIsValid] = await Promise.all([
      this.usersService.validatePassword(user, password),
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(otp, user),
    ]);

    if ([usernameIsValid, passwordIsValid, otpIsValid].includes(false)) {
      throw new BadRequestException('Wrong credentials provided');
    }

    return {
      accessToken: await this.tokensService.generateAccessToken(user),
      refreshToken: await this.tokensService.generateRefreshToken(user),
    };
  }
}
