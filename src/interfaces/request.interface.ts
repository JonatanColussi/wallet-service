import { Request } from 'express';

import { WithId } from './mongodb.interface';

import { User } from '../modules/users/users.model';

export interface RequestWithUser extends Request {
  user: WithId<User>;
}
