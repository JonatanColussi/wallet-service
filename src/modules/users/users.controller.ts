import { pick } from '@gilbarbara/helpers';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { GetUsersDto, UpdateUserDto } from './dto';
import { User } from './users.model';
import { UsersService } from './users.service';

import { BadRequestDto } from '../../dtos';
import { RequestWithUser } from '../../interfaces';
import { JWTGuard } from '../auth/guards/jwt-auth.guard';
import { TwoFactorAuthenticationService } from '../auth/services/twoFactorAuthentication.service';

@Controller('/user')
@ApiTags('user')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(JWTGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
  ) {}

  // eslint-disable-next-line class-methods-use-this
  @Get('/me')
  @ApiOkResponse({ type: GetUsersDto, description: 'Logged user data' })
  public async getUser(@Request() request: RequestWithUser) {
    return pick(request.user, 'active', 'email', 'phone', 'username', 'id');
  }

  @Patch('/me')
  @ApiAcceptedResponse({ description: 'Update data successfully' })
  @ApiBadRequestResponse({ type: BadRequestDto, description: 'Invalid request' })
  @HttpCode(HttpStatus.ACCEPTED)
  public async updateUser(@Request() request: RequestWithUser, @Body() body: UpdateUserDto) {
    const changes: Partial<User> = {};

    if (body.password) {
      if (
        !body.oldPassword ||
        !this.usersService.validatePassword(request.user, body.oldPassword)
      ) {
        throw new BadRequestException('Incorrect Password');
      }

      if (
        !this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
          body.otp,
          request.user,
        )
      ) {
        throw new BadRequestException('Invalid OTP');
      }

      changes.password = body.password;
    }

    if (body.email) {
      if (await this.usersService.verifyEmailDuplicated(request.user, body.email)) {
        throw new ConflictException('Email already in use');
      }

      changes.email = body.email;
    }

    await this.usersService.update(request.user.id, changes);
  }
}
