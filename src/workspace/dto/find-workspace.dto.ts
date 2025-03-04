import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindWorkspaceDto {
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ description: '페이지번호', default: 1 })
  page: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '조회 시작일', required: false })
  startDate?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '조회 종료일', required: false })
  endDate?: string;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ description: '페이지별개수', default: 10 })
  row: number;

  @IsOptional()
  @IsString()
  keyword?: string;
}
