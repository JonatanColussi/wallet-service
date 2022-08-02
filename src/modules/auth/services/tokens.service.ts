import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';

import { refreshTokenTtl } from '../../../constants';
import { WithId } from '../../../interfaces';
import { User } from '../../users/users.model';
import { UsersService } from '../../users/users.service';
import { RefreshTokenPayload } from '../interfaces';
import { RefreshTokensRepository } from '../repositories/refresh-tokens.repository';

const BASE_OPTIONS: SignOptions = {
  issuer: 'https://my-app.com',
  audience: 'https://my-app.com',
};

@Injectable()
export class TokensService {
  constructor(
    private readonly usersService: UsersService,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly jwtService: JwtService,
  ) {}

  async generateAccessToken(user: WithId<User>) {
    const options: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id),
    };

    return this.jwtService.signAsync({}, options);
  }

  async generateRefreshToken(user: WithId<User>, expiresIn: number = refreshTokenTtl) {
    const token = await this.refreshTokensRepository.create(user, expiresIn);

    const options: SignOptions = {
      ...BASE_OPTIONS,
      expiresIn,
      subject: String(user.id),
      jwtid: String(token.id),
    };

    return this.jwtService.signAsync({}, options);
  }

  async resolveRefreshToken(encoded: string) {
    const payload = await this.decodeRefreshToken(encoded);
    const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

    if (!token) {
      throw new UnprocessableEntityException('Refresh token not found');
    }

    if (token.isRevoked) {
      throw new UnprocessableEntityException('Refresh token revoked');
    }

    const user = await this.getUserFromRefreshTokenPayload(payload);

    if (!user) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return { user, token };
  }

  async createAccessTokenFromRefreshToken(refresh: string) {
    const { user } = await this.resolveRefreshToken(refresh);

    const token = await this.generateAccessToken(user as WithId<User>);

    return { user, token };
  }

  private async decodeRefreshToken(token: string) {
    try {
      return this.jwtService.verifyAsync(token);
    } catch (error) {
      const newError =
        error instanceof TokenExpiredError
          ? new UnprocessableEntityException('Refresh token expired')
          : new UnprocessableEntityException('Refresh token malformed');

      throw newError;
    }
  }

  private async getUserFromRefreshTokenPayload(payload: RefreshTokenPayload) {
    const { sub: userId } = payload;

    if (!userId) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return this.usersService.findOne(userId);
  }

  private async getStoredTokenFromRefreshTokenPayload(payload: RefreshTokenPayload) {
    const { jti: tokenId } = payload;

    if (!tokenId) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return this.refreshTokensRepository.findOne(tokenId);
  }
}
