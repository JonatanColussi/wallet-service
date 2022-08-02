import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  CreateUserDto,
  CreateUserResponseDto,
  LoginDto,
  LoginResponseDto,
  OtpDto,
  RefreshTokenDto,
  SetPasswordDto,
} from './dto';
import { AuthService } from './services/auth.service';
import { TokensService } from './services/tokens.service';
import { TwoFactorAuthenticationService } from './services/twoFactorAuthentication.service';

import { BadRequestDto } from '../../dtos';
import { UsersService } from '../users/users.service';
import { WalletsService } from '../wallets/wallets.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly tokensService: TokensService,
    private readonly walletsService: WalletsService,
  ) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create User' })
  @ApiCreatedResponse({ type: CreateUserResponseDto, description: 'User created' })
  @ApiBadRequestResponse({ type: BadRequestDto, description: 'Invalid request' })
  async create(@Body() data: CreateUserDto) {
    const user = await this.usersService.create(data);

    const { qrcode, secret } =
      await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(user);

    await this.usersService.update(user.id, { twoFactorAuthenticationSecret: secret });

    return {
      qrcode,
      secret,
      userId: user.id,
    };
  }

  @Patch('activate/:userId')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Activate User' })
  @ApiAcceptedResponse({ description: 'OTP valid, the user will be activated ' })
  @ApiBadRequestResponse({ type: BadRequestDto, description: 'Invalid request' })
  async activate(@Param('userId') userId: string, @Body() body: OtpDto) {
    const { otp } = body;
    const user = await this.usersService.findOne(userId);

    const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
      otp,
      user,
    );

    if (!isCodeValid) {
      throw new BadRequestException('Wrong authentication code');
    }

    await this.usersService.update(user.id, { active: true });
  }

  @Patch('set-password/:userId')
  @ApiOperation({ summary: 'Define user password' })
  @ApiOkResponse({ type: LoginResponseDto, description: 'Password defined successfully' })
  @ApiBadRequestResponse({ type: BadRequestDto, description: 'Invalid request' })
  async setPassword(@Param('userId') userId: string, @Body() body: SetPasswordDto) {
    const { password } = body;
    const user = await this.usersService.findOne(userId);

    if (!user.active) {
      throw new BadRequestException('User not active');
    }

    if (user.password) {
      throw new BadRequestException('User already has password');
    }

    await this.usersService.update(user.id, { password });
    await this.walletsService.createWallets(user);

    return {
      accessToken: await this.tokensService.generateAccessToken(user),
      refreshToken: await this.tokensService.generateRefreshToken(user),
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiBadRequestResponse({ type: BadRequestDto, description: 'Invalid request' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOkResponse({ type: LoginResponseDto, description: 'Login successfully' })
  async login(@Body() body: LoginDto) {
    const { otp, password, username } = body;

    return this.authService.login(username, password, otp);
  }

  @Post('/refresh')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiBadRequestResponse({ type: BadRequestDto, description: 'Invalid request' })
  @ApiOkResponse({ type: LoginResponseDto, description: 'Refresh successfully' })
  async refresh(@Body() body: RefreshTokenDto) {
    const { token, user } = await this.tokensService.createAccessTokenFromRefreshToken(
      body.refreshToken,
    );

    return {
      accessToken: token,
      refreshToken: await this.tokensService.generateRefreshToken(user),
    };
  }
}
