import { ObjectId, Schema } from 'mongoose';

export interface RefreshToken {
  expiresAt: Date;
  isRevoked: boolean;
  userId: ObjectId;
}

export const RefreshTokenSchema = new Schema<RefreshToken>({
  expiresAt: { type: Date },
  isRevoked: { type: Boolean },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});
