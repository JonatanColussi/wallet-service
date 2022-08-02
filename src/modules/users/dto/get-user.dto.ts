import { ApiProperty } from '@nestjs/swagger';

export class GetUsersDto {
  @ApiProperty()
  active: boolean;

  @ApiProperty({ format: 'email' })
  email: string;

  @ApiProperty({ example: '+5551999999999' })
  phone: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  id: string;
}
