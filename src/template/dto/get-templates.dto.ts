import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsOptional } from 'class-validator';

import { YesNo } from '@app/types/common/base.type';

export class GetTemplatesDto {
  @ApiPropertyOptional({ description: '필터링: 사용 여부' })
  @IsEnum(YesNo, { message: 'isUsed must be Y or N' })
  @IsOptional()
  isUsed?: YesNo;

  @ApiPropertyOptional({ description: '필터링: 삭제 여부' })
  @IsEnum(YesNo, { message: 'isDeleted must be Y or N' })
  @IsOptional()
  isDeleted?: YesNo;
}
