import { ObjectId, Schema } from 'mongoose';

export interface Wallet {
  balance: number;
  type: 'crypto' | 'fiat';
  userId: ObjectId;
}

export const WalletSchema = new Schema<Wallet>({
  balance: { type: Number },
  type: { type: String },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});
