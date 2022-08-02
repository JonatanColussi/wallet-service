import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { Model, ObjectId } from 'mongoose';

import { User } from './users.model';

import { WithId } from '../../interfaces';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly UserModel: Model<User>) {}

  async create<T extends Pick<User, 'username' | 'email' | 'phone'>>(user: T) {
    const existUser = await this.UserModel.find({
      $or: [{ email: user.email }, { username: user.username }],
      active: true,
      password: { $exists: true },
    });

    if (existUser.length) {
      throw new ConflictException('User already exists');
    }

    const data = { ...user, active: false };

    const { id } = await new this.UserModel(data).save();

    return { ...data, id } as WithId<T>;
  }

  async update(id: ObjectId, data: Partial<User>) {
    const updateDate = { ...data };

    if (updateDate.password) {
      updateDate.password = await bcrypt.hash(updateDate.password, 12);
    }

    await this.UserModel.findByIdAndUpdate(id, updateDate);
  }

  async get(filters: Partial<User>) {
    const user = await this.UserModel.findOne({
      ...filters,
      active: true,
      password: { $exists: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { ...user.toObject(), id: user.id } as WithId<User>;
  }

  async findOne(id: string | ObjectId) {
    const user = await this.UserModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { ...user.toObject(), id: user.id } as WithId<User>;
  }

  // eslint-disable-next-line class-methods-use-this
  async validatePassword(user: User, password: string) {
    return bcrypt.compare(password, user.password);
  }

  async verifyEmailDuplicated(user: WithId<User>, email: string) {
    const users = await this.UserModel.find({ email, _id: { $ne: user.id } });

    return users.length > 0;
  }
}
