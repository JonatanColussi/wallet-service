import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TransactionParamsDto {
  @ApiProperty({ enum: ['crypto', 'fiat'] })
  @IsString()
  type: 'crypto' | 'fiat';

  @ApiProperty()
  @IsString()
  to: string;
}
