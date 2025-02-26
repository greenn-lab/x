import { Module } from '@nestjs/common';

import { MemberController } from '@app/member/member.controller';
import { MemberService } from '@app/member/member.service';
import { MemberRepository } from '@app/member/repositories/member.repository';

@Module({
  controllers: [MemberController],
  providers: [MemberService, MemberRepository],
})
export class MemberModule {}
