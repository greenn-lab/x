import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { Module } from '@app/types/template/template.type';
export class UpdateTemplateDto {
  @ApiPropertyOptional({ description: '버전 정보', example: '1.0.1' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({ description: '제목', example: '테스트용 템플릿입니다' })
  @IsString()
  title: string;

  @ApiProperty({
    description: '사용자에 의해 조합된 모듈 배열',
    required: true,
    type: [Module],
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
            value: '{{st_topic}}\n{{st_summary}}\n{{st_issues}}\n{{st_tasks}}',
          },
          { index: 2, type: 'basic', value: '☆★☆★☆' },
        ],
      },
    ],
  })
  @IsNotEmpty()
  @IsArray({ message: '모듈 조합은 배열 형식으로 입력해주세요.' })
  template: Module[];

  @ApiPropertyOptional({ description: '설명', example: '' })
  @IsOptional()
  @IsString()
  description?: string;
}

export interface UpdateTemplateDtoPlus extends UpdateTemplateDto {
  workspaceId: string;
  editorPID: string;
  preview?: string;
}
