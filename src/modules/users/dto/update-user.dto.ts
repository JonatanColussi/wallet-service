import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { User } from '../users.model';

export class UpdateUserDto implements Pick<User, 'password' | 'email'> {
  @ApiProperty({ format: 'email', required: false })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  oldPassword: string;

  @ApiProperty({ minLength: 6, maxLength: 6, example: '000000', required: false })
  @IsNumberString({ no_symbols: true })
  @MinLength(6)
  @MaxLength(6)
  @IsOptional()
  otp: string;
}
