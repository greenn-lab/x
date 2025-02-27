import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString, Matches } from 'class-validator';

// 요청 DTO
export class FindAllWorkspaceStatDto {
  @ApiPropertyOptional({ description: '연도 (YYYY)', example: '2024' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'Year must be in YYYY format' })
  year?: string;
}

// 응답 DTO
export class WorkspaceStatItemDto {
  @ApiProperty({ description: '월 (YYYY-MM)' })
  month: string;

  @ApiProperty({ description: '총 사용 시간' })
  totalDuration: number;

  @ApiProperty({ description: '총 사용 횟수' })
  totalCount: number;

  @ApiProperty({ description: '완료된 작업 총 시간' })
  doneTotalDuration: number;

  @ApiProperty({ description: '완료된 작업 횟수' })
  doneCount: number;

  @ApiProperty({ description: '오류 발생 총 시간' })
  errorTotalDuration: number;

  @ApiProperty({ description: '오류 발생 횟수' })
  errorCount: number;

  @ApiProperty({ description: 'LLM 총 토큰 수' })
  llmTotalToken: number;

  @ApiProperty({ description: 'LLM 총 사용 횟수' })
  llmTotalCount: number;

  @ApiProperty({ description: 'LLM 완료 횟수' })
  llmDoneCount: number;

  @ApiProperty({ description: 'LLM 오류 횟수' })
  llmErrorCount: number;
}
