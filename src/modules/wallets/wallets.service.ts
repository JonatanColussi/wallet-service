import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';

import { Transaction } from './transactions.model';
import { Wallet } from './wallets.model';

import { WithId } from '../../interfaces';
import { User } from '../users/users.model';

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel('Wallet') private readonly WalletModel: Model<Wallet>,
    @InjectModel('Transaction') private readonly TransactionModel: Model<Transaction>,
  ) {}

  async createWallets(user: WithId<User>) {
    const cryptoWalletBalance = Math.floor(100000 + Math.random() * 900000);
    const fiatWalletBalance = Math.floor(100000 + Math.random() * 900000);

    const [cryptoWallet, fiatWallet] = await Promise.all([
      new this.WalletModel({
        userId: user.id,
        balance: cryptoWalletBalance,
        type: 'crypto',
      }).save(),
      new this.WalletModel({
        userId: user.id,
        balance: fiatWalletBalance,
        type: 'fiat',
      }).save(),
    ]);

    await Promise.all([
      new this.TransactionModel({ amount: cryptoWalletBalance, to: cryptoWallet.id }).save(),
      new this.TransactionModel({ amount: fiatWalletBalance, to: fiatWallet.id }).save(),
    ]);
  }

  private async getWallet(userId: ObjectId | string, type: 'crypto' | 'fiat') {
    const wallet = await this.WalletModel.findOne({ userId, type });

    return wallet as WithId<Wallet>;
  }

  async makeTransaction(
    from: WithId<User>,
    to: ObjectId | string,
    amount: number,
    type: 'crypto' | 'fiat',
  ) {
    const [fromWallet, toWallet] = await Promise.all([
      this.getWallet(from.id, type),
      this.getWallet(to, type),
    ]);

    if (!fromWallet || !toWallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (fromWallet.balance < amount) {
      throw new BadRequestException('Insuficient funds');
    }

    await new this.TransactionModel({ amount, from: fromWallet.id, to: toWallet.id }).save();

    await this.updateBalance(fromWallet, toWallet);
  }

  private async updateBalance(...wallets: WithId<Wallet>[]) {
    await Promise.all(
      wallets.map(async wallet => {
        const transactions = await this.TransactionModel.find({
          $or: [{ from: wallet.id }, { to: wallet.id }],
        });

        const balance =
          Math.round(
            transactions
              .map(transaction =>
                String(transaction.from) === String(wallet.id)
                  ? transaction.amount * -1
                  : transaction.amount,
              )
              .reduce((amount, acc) => acc + amount, 0) * 100,
          ) / 100;

        await this.WalletModel.findByIdAndUpdate(wallet.id, { balance });
      }),
    );
  }

  async getWallets(user: WithId<User>) {
    const wallets = await this.WalletModel.find({ userId: user.id });

    return wallets.map(wallet => wallet.toObject() as WithId<Wallet>);
  }
}
