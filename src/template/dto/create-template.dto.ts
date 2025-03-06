import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { YesNo } from '@app/types/common/base.type';
import { Module } from '@app/types/template/template.type';

// 요청 DTO
export class CreateTemplateDto {
  @ApiProperty({
    description: '제목란',
    example: '테스트용 템플릿입니다',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: '사용자에 의해 조합된 모듈 배열',
    required: true,
    type: () => [Module],
    example: [
      {
        index: 0,
        moduleKey: 'title',
        items: [{ index: 0, type: 'basic', value: '{{title}}' }],
      },
      {
        index: 1,
        moduleKey: 'tasks',
        items: [{ index: 0, type: 'basic', value: '{{tasks}}' }],
      },
      {
        index: 2,
        moduleKey: 'topics',
        items: [{ index: 0, type: 'basic', value: '주제{{topics}}' }],
      },
      {
        index: 3,
        moduleKey: 'keywords',
        items: [{ index: 0, type: 'basic', value: '키워드\n{{keywords}}' }],
      },
      {
        index: 4,
        moduleKey: 'speakerInfo',
        items: [
          {
            index: 0,
            type: 'basic',
            value: '참석자\n{{speakerInfo}}\n직급 제외',
          },
        ],
      },
      {
        index: 5,
        moduleKey: 'summary',
        items: [{ index: 0, type: 'basic', value: '{{summary}}' }],
      },
      {
        index: 6,
        moduleKey: 'issues',
        items: [{ index: 0, type: 'basic', value: '{{issues}}' }],
      },
      {
        index: 7,
        moduleKey: 'summaryTime',
        items: [
          { index: 0, type: 'basic', value: '## ■주제별 상세 요약\n\n' },
          {
            index: 1,
            type: 'loop',
            value: '{{st_topic}}\n### 요약{{summary}}\n{{issues}}\n{{tasks}}',
          },
          { index: 2, type: 'basic', value: '☆★☆★☆' },
        ],
      },
    ],
  })
  @IsNotEmpty()
  @IsArray({ message: '모듈 조합은 배열 형식으로 입력해주세요.' })
  template: Module[];

  @ApiProperty({
    description: '사용자가 직접 입력하는 버전란. 미입력시 빈문자열로 저장',
    example: '1.0.1',
    default: '',
    required: false,
  })
  @ApiPropertyOptional({
    description: '버전 정보',
    example: '1.0.1',
    default: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({
    description: '템플릿 사용 여부 구분. 미입력시 N',
    enum: YesNo,
    example: YesNo.N,
    default: YesNo.N,
    required: false,
  })
  @IsOptional()
  @IsEnum(YesNo)
  isUsed?: YesNo;

  @ApiProperty({
    description: '템플릿 설명란. 미입력시 빈문자열로 저장',
    example: '설명란 입력합니다',
    default: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export interface CreateTemplateDtoPlus extends CreateTemplateDto {
  workspaceId: string;
  creatorPID: string;
  editorPID: string;
}

export interface CreateTemplateResponseDto {
  templateId: string;
}
