// 템플릿 삭제 DTO

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { YesNo } from '@app/types/common/base.type';

// { id: string; isUsed: YesNo; isDeleted: YesNo }

export class StatusDto {
  @ApiPropertyOptional({ description: '사용 여부', default: 'N' })
  @IsOptional({ message: '사용 여부는 문자열로 입력해주세요.' })
  @IsEnum(YesNo)
  isUsed?: YesNo = YesNo.N;

  @ApiPropertyOptional({ description: '삭제 여부', default: 'N' })
  @IsOptional({ message: '삭제 여부는 문자열로 입력해주세요.' })
  @IsEnum(YesNo)
  isDeleted?: YesNo = YesNo.N;
}

export class UpdateTemplateStatusDto extends StatusDto {
  @ApiProperty({ description: '템플릿 ID' })
  @IsNotEmpty()
  @IsString()
  templateId: string;
}

export class UpdateTemplateStatusResponseDto extends StatusDto {
  @ApiProperty({ description: '템플릿 ID' })
  @IsString()
  templateId: string;
}
