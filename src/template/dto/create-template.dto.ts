import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

import { YesNo } from '@app/types/common/base.type';

export class CreateTemplateDto {
  @ApiPropertyOptional({ description: '버전 정보' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({ description: '제목' })
  @IsString()
  title: string;

  @ApiProperty({
    description: '템플릿 내용',
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: true,
    },
  })
  @IsArray()
  @IsObject({ each: true })
  template: object[];

  @ApiPropertyOptional({ description: '사용 여부', default: YesNo.N })
  @IsOptional()
  @IsString()
  isUsed?: YesNo = YesNo.N;

  @ApiPropertyOptional({ description: '설명' })
  @IsOptional()
  @IsString()
  description?: string;
}

export interface CreateTemplateDtoPlus extends CreateTemplateDto {
  workspaceId: string;
  creatorPID: string;
  editorPID: string;
  preview?: string;
}
