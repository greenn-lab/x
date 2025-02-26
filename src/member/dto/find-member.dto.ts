import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindMemberDto {
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ description: '페이지번호', default: 1 })
  page: number;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ description: '페이지별개수', default: 20 })
  row: number;

  @IsOptional()
  @IsString()
  keyword?: string;
}
