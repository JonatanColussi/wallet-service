import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';

import { WithId } from '../../../interfaces';
import { User } from '../../users/users.model';
import { RefreshToken } from '../models/refresh-tokens.model';

@Injectable()
export class RefreshTokensRepository {
  constructor(
    @InjectModel('RefreshToken') private readonly RefreshTokenModel: Model<RefreshToken>,
  ) {}

  async create(user: WithId<User>, ttl: number) {
    const expiration = new Date();

    expiration.setTime(expiration.getTime() + ttl);

    const data: RefreshToken = { isRevoked: false, userId: user.id, expiresAt: expiration };

    const { id } = await new this.RefreshTokenModel(data).save();

    return { ...data, id } as WithId<RefreshToken>;
  }

  async findOne(id: ObjectId | string) {
    const token = await this.RefreshTokenModel.findById(id);

    if (!token) {
      throw new NotFoundException('Refresh token not found');
    }

    return token;
  }
}
