import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

import { StatType } from '@app/types/stat/stat.type';

// 요청 DTO
export class FindMemberStatDto {
  @ApiPropertyOptional({
    description: '통계 조회 타입',
    enum: StatType,
    default: StatType.HOURLY,
  })
  @IsEnum(StatType)
  @IsOptional()
  type?: StatType = StatType.HOURLY;

  @ApiPropertyOptional({
    type: Date,
    default: new Date(),
    description: '조회 기준 날짜 (YYYY-MM-DD)',
    example: '2025-02-25',
  })
  @IsDateString()
  @IsOptional()
  @Transform(
    ({ value }): string => value || new Date().toISOString().substring(0, 10),
  )
  date?: string = new Date().toISOString().substring(0, 10);
}

// 응답 DTO
export class MemberStatItemDto {
  @ApiProperty({ description: '시간 값', required: false })
  hour?: number;

  @ApiProperty({ description: '날짜 값', required: false })
  date?: string;

  @ApiProperty({ description: '주차 값', required: false })
  week?: number;

  @ApiProperty({ description: '월 값', required: false })
  month?: string;

  @ApiProperty({ description: '콘텐츠 총 사용 시간' })
  contentTotalDuration: number;

  @ApiProperty({ description: '콘텐츠 사용 횟수' })
  contentCount: number;

  @ApiProperty({ description: 'LLM 총 토큰 수' })
  llmTotalToken: number;

  @ApiProperty({ description: 'LLM 사용 횟수' })
  llmCount: number;
}

export class MemberStatResponseDto {
  @ApiProperty({ description: '조회 기준 날짜' })
  _date: string;

  @ApiProperty({ description: '통계 데이터 목록', type: [MemberStatItemDto] })
  stats: MemberStatItemDto[];

  constructor(date: string, stats: MemberStatItemDto[]) {
    this._date = date;
    this.stats = stats;
  }
}
