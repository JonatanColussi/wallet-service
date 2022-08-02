import { Schema } from 'mongoose';

export interface User {
  active: boolean;
  email: string;
  password: string;
  phone: string;
  twoFactorAuthenticationSecret: string;
  username: string;
}

export const UserSchema = new Schema<User>({
  active: { type: Boolean, default: false },
  email: { type: String, required: true },
  password: { type: String, required: false },
  phone: { type: String, required: true },
  twoFactorAuthenticationSecret: { type: String, required: false },
  username: { type: String, required: true },
});
