import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty } from 'class-validator';

import { MemberRole } from '@app/types/common/base.type';

export class InviteMemberDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: '이메일', default: 'tester@test.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ description: '권한', default: MemberRole.MEMBER })
  role: MemberRole;
}
