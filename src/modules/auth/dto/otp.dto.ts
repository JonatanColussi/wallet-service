import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, MaxLength, MinLength } from 'class-validator';

export class OtpDto {
  @ApiProperty({ minLength: 6, maxLength: 6, example: '000000' })
  @IsNumberString({ no_symbols: true })
  @MinLength(6)
  @MaxLength(6)
  otp: string;
}
