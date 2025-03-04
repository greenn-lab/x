import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { FindMemberDto } from '@app/member/dto/find-member.dto';
import { Member } from '@app/member/entities/member.entity';

const PROJECTION = [
  'member.id',
  'member.role',
  'user.pid',
  'user.createAt',
  'user.lastLogin',
  'profile.name',
  'profile.email',
  'profile.nickName',
  'profile.thumbnailUrl',
  'workspace.id',
  'workspace.name',
  'workspace.domain',
];

@Injectable()
export class MemberRepository extends Repository<Member> {
  constructor(dataSource: DataSource) {
    super(Member, dataSource.createEntityManager());
  }

  async findAll(workspaceId: string, options: FindMemberDto) {
    const { page, row } = options;

    const [members, _count] = await this.createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.workspace', 'workspace')
      .leftJoinAndSelect('user.profile', 'profile')
      .select(PROJECTION)
      .where('member.workspaceId = :workspaceId', { workspaceId })
      .skip((page - 1) * row)
      .take(row)
      .getManyAndCount();

    return {
      _count,
      _pageCount: Math.ceil(_count / row),
      members,
    };
  }

  async findById(id: string) {
    return await this.createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.workspace', 'workspace')
      .leftJoinAndSelect('user.profile', 'profile')
      .select(PROJECTION)
      .where('member.id = :id', { id })
      .getOne();
  }

  async findByEmail(email: string) {
    return await this.createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.workspace', 'workspace')
      .leftJoinAndSelect('user.profile', 'profile')
      .select(PROJECTION)
      .where('profile.email = :email', { email })
      .getOne();
  }

  async findByPid(pid: string) {
    return await this.createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.workspace', 'workspace')
      .leftJoinAndSelect('user.profile', 'profile')
      .select(PROJECTION)
      .where('user.pid = :pid', { pid })
      .getOne();
  }

  async findMemberCountByWorkspaceId(workspaceId: string) {
    const result = await this.createQueryBuilder('member')
      .select(['member.role AS role', 'COUNT(member.id) AS count'])
      .where('member.workspaceId = :workspaceId', { workspaceId })
      .groupBy('member.role')
      .getRawMany<{ role: string; count: string }>();

    return result
      .filter(({ role }) => role !== 'ADMIN')
      .reduce(
        (acc, { role, count }) => {
          acc[role] = Number(count);
          return acc;
        },
        {} as Record<string, number>,
      );
  }
}
