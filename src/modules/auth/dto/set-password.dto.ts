import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { User } from '../../users/users.model';

export class SetPasswordDto implements Pick<User, 'password'> {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
