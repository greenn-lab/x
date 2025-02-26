import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';

import { MemberRole } from '@app/types/common/base.type';
import { StatType } from '@app/types/stat/stat.type';

// 요청 DTO
export class FindAllMemberStatDto {
  @ApiPropertyOptional({
    description: '통계 조회 타입',
    enum: StatType,
    default: StatType.DAILY,
  })
  @IsEnum(StatType)
  @IsOptional()
  type?: StatType = StatType.DAILY;

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

  @ApiPropertyOptional({
    type: Number,
    default: 1,
    minimum: 1,
    description: '페이지 번호',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    type: Number,
    default: 10,
    minimum: 1,
    maximum: 100,
    description: '페이지당 행 수',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  row?: number = 10;
}

// 응답 DTO
export class MemberStatListItemDto {
  @ApiProperty({ description: '멤버 ID' })
  id: string;

  @ApiProperty({ description: '멤버 역할', enum: MemberRole })
  role: MemberRole;

  @ApiProperty({ description: '워크스페이스 정보' })
  workspace: {
    id: string;
    name: string;
    domain: string;
    config: {
      allowGuest: boolean;
      allowShare: boolean;
    };
  };

  @ApiProperty({ description: '사용자 정보' })
  user: {
    pid: string;
    lastLogin: Date | null;
    createAt: Date;
    profile: {
      name: string | null;
      email: string | null;
      nickName: string | null;
      thumbnailUrl: string | null;
    };
  };

  @ApiProperty({ description: '통계 정보' })
  stats: {
    contentTotalDuration: number;
    contentCount: number;
    llmTotalToken: number;
    llmCount: number;
  };
}

export class MemberStatListResponseDto {
  @ApiProperty({ description: '조회 기준 날짜' })
  _date: string;

  @ApiProperty({ description: '총 멤버 수' })
  _count: number;

  @ApiProperty({ description: '총 페이지 수' })
  _pageCount: number;

  @ApiProperty({ description: '멤버 통계 목록', type: [MemberStatListItemDto] })
  members: MemberStatListItemDto[];

  constructor(
    date: string,
    count: number,
    pageCount: number,
    members: MemberStatListItemDto[],
  ) {
    this._date = date;
    this._count = count;
    this._pageCount = pageCount;
    this.members = members;
  }
}
