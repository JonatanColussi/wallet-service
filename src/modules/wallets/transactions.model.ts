import { ObjectId, Schema } from 'mongoose';

export interface Transaction {
  amount: number;
  from: ObjectId;
  to: ObjectId;
}

export const TransactionSchema = new Schema<Transaction>(
  {
    amount: { type: Number },
    from: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
    },
  },
  { timestamps: true },
);
