import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from './auth.controller';
import { RefreshTokenSchema } from './models';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { AuthService } from './services/auth.service';
import { TokensService } from './services/tokens.service';
import { TwoFactorAuthenticationService } from './services/twoFactorAuthentication.service';

import { jwtExpiresIn, jwtSecret } from '../../constants';
import { UsersModule } from '../users/users.module';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  controllers: [AuthController],
  imports: [
    MongooseModule.forFeature([
      {
        name: 'RefreshToken',
        schema: RefreshTokenSchema,
      },
    ]),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
    UsersModule,
    WalletsModule,
  ],
  providers: [TokensService, RefreshTokensRepository, TwoFactorAuthenticationService, AuthService],
})
export class AuthModule {}
