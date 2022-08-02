import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { UsersController } from './users.controller';
import { UserSchema } from './users.model';
import { UsersService } from './users.service';

import { TwoFactorAuthenticationService } from '../auth/services/twoFactorAuthentication.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  controllers: [UsersController],
  imports: [
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      },
    ]),
    PassportModule,
  ],
  providers: [UsersService, JwtStrategy, TwoFactorAuthenticationService],
  exports: [UsersService],
})
export class UsersModule {}
