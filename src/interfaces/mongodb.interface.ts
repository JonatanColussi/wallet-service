import { ObjectId } from 'mongoose';

export type WithId<T> = T & { id: ObjectId };
