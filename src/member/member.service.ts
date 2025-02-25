import { Injectable, Logger } from '@nestjs/common';

import { FindMemberDto } from '@app/member/dto/find-member.dto';
import { MemberRepository } from '@app/member/repositories/member.repository';

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);

  constructor(private readonly memberRepository: MemberRepository) {}

  //
  findAll(workspaceId: string, condition: FindMemberDto) {
    return this.memberRepository.findAll(workspaceId, condition);
  }

  findOne(id: string) {
    return this.memberRepository.findById(id);
  }
}
