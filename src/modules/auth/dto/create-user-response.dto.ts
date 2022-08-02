import { ApiProperty } from '@nestjs/swagger';

export class CreateUserResponseDto {
  @ApiProperty({
    format: 'byte',
    example: 'data:image/png;base64,aBcdxYz',
  })
  qrcode: string;

  @ApiProperty({ example: 'G46SST3YCAUDE7DT' })
  secret: string;

  @ApiProperty({ example: '62e82ba1d2853887373cbf6c' })
  userId: string;
}
