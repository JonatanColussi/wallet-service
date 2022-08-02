import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ minLength: 6, maxLength: 6, example: '000000' })
  @IsNumberString({ no_symbols: true })
  @MinLength(6)
  @MaxLength(6)
  otp: string;
}
