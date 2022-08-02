import { pick } from '@gilbarbara/helpers';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { TransactionDataDto, TransactionParamsDto, WalletsResposeDto } from './dto';
import { WalletsService } from './wallets.service';

import { BadRequestDto } from '../../dtos';
import { RequestWithUser } from '../../interfaces';
import { JWTGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wallet')
@ApiTags('wallet')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(JWTGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post('/:type(crypto|fiat)/:to')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Make transaction' })
  @ApiCreatedResponse({ description: 'Transaction created successfully' })
  @ApiBadRequestResponse({ type: BadRequestDto, description: 'Invalid request' })
  async create(
    @Request() request: RequestWithUser,
    @Param() params: TransactionParamsDto,
    @Body() body: TransactionDataDto,
  ) {
    await this.walletsService.makeTransaction(request.user, params.to, body.amount, params.type);
  }

  @Get()
  @ApiOperation({ summary: 'Get user wallets' })
  @ApiOkResponse({ type: WalletsResposeDto, isArray: true })
  async wallets(@Request() request: RequestWithUser) {
    const wallets = await this.walletsService.getWallets(request.user);

    return wallets.map(wallet => pick(wallet, 'type', 'balance'));
  }
}
