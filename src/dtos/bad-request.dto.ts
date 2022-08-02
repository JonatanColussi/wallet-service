import { ApiProperty } from '@nestjs/swagger';

export class BadRequestDto {
  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty()
  message: string[] | string;

  @ApiProperty({ example: 400 })
  statusCode: number;
}
