import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

import { Module } from '@app/types/template/template.type';
export class UpdateTemplateDto {
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
  template: Module[];

  @ApiPropertyOptional({ description: '설명' })
  @IsOptional()
  @IsString()
  description?: string;
}

export interface UpdateTemplateDtoPlus extends UpdateTemplateDto {
  workspaceId: string;
  editorPID: string;
  preview?: string;
}
