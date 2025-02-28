import { HttpException, Injectable, Logger } from '@nestjs/common';

import { FindMemberDto } from '@app/member/dto/find-member.dto';
import { InviteMemberDto } from '@app/member/dto/invite-member.dto';
import { UpdateMemberDto } from '@app/member/dto/update-member.dto';
import { InviteRepository } from '@app/member/repositories/invite.repository';
import { MemberRepository } from '@app/member/repositories/member.repository';

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly inviteRepository: InviteRepository,
  ) {}

  //
  findAll(workspaceId: string, condition: FindMemberDto) {
    return this.memberRepository.findAll(workspaceId, condition);
  }

  findOne(id: string) {
    return this.memberRepository.findById(id);
  }

  async invite(workspaceId: string, { email, role }: InviteMemberDto) {
    const member = await this.memberRepository.findByEmail(email);

    if (member && member.workspace.domain !== 'global') {
      throw new HttpException('1016', 501);
    }

    if (await this.inviteRepository.findOneBy({ email })) {
      throw new HttpException('1017', 500);
    }

    // noinspection UnnecessaryLocalVariableJS
    const invited = await this.inviteRepository.createInvite({
      workspaceId,
      email,
      role,
      expireAt: this.getExpireDateAfter7Days(),
      updateAt: new Date(),
    });

    // TODO notification

    return invited;
  }

  async update(id: string, member: UpdateMemberDto) {
    return await this.memberRepository.save({ id, role: member.role });
  }

  private getExpireDateAfter7Days() {
    return new Date(Date.now() + 7 * (24 * 60 * 60 * 1000));
  }
}
