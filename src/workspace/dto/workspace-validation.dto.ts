import { ApiProperty } from '@nestjs/swagger';

import { IsString } from 'class-validator';

export class WorkspaceValidationNameDto {
  @IsString()
  @ApiProperty({ description: '워크스페이스 이름' })
  name: string;
}

export class WorkspaceValidationDto extends WorkspaceValidationNameDto {
  @IsString()
  @ApiProperty({ description: '워크스페이스 도메인' })
  domain: string;
}
