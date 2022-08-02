import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TransactionSchema } from './transactions.model';
import { WalletsController } from './wallets.controller';
import { WalletSchema } from './wallets.model';
import { WalletsService } from './wallets.service';

@Module({
  controllers: [WalletsController],
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Wallet',
        schema: WalletSchema,
      },
      {
        name: 'Transaction',
        schema: TransactionSchema,
      },
    ]),
  ],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
