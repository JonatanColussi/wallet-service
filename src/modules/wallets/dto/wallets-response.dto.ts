import { ApiProperty } from '@nestjs/swagger';

export class WalletsResposeDto {
  @ApiProperty({ enum: ['crypto', 'fiat'] })
  type: 'crypto' | 'fiat';

  @ApiProperty()
  balance: number;
}
