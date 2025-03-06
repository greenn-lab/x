import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { logTransaction } from '@app/log/schemas/log.schema';

export class CreateLogDto {
  @ApiProperty({
    type: String,
    description: '이메일',
    example: 'test@test.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: String,
    description: '그룹',
    example: 'test',
  })
  @IsString()
  @IsNotEmpty()
  group: string;

  @ApiPropertyOptional({
    type: Array,
    default: [],
    example: [
      {
        date: '오후 3:24:42',
        message: 'Component mounted',
      },
      {
        date: '오후 3:24:42',
        message: 'Initialize database',
      },
    ],
  })
  @IsArray()
  @IsOptional()
  transaction?: logTransaction[];
}
