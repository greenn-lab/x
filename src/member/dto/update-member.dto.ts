import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty } from 'class-validator';

import { MemberRole } from '@app/types/common/base.type';

export class UpdateMemberDto {
  @IsNotEmpty()
  @IsEnum(MemberRole)
  @ApiProperty({ description: '권한', default: MemberRole.MEMBER })
  role: MemberRole;
}
