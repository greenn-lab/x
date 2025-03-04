import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

import { WorkspaceValidationDto } from '@app/workspace/dto/workspace-validation.dto';

export class CreateWorkspaceDto extends WorkspaceValidationDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: '워크스페이스 설명', required: false })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiHideProperty()
  inviteCode?: string;

  @IsOptional()
  @IsString()
  @ApiHideProperty()
  thumbnailUrl?: string;

  @IsOptional()
  @ApiProperty({
    description: '파일',
    type: 'string',
    format: 'binary',
    required: false,
  })
  file?: Express.Multer.File;
}
