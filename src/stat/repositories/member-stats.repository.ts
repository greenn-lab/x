import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { FindAllMemberStatDto } from '@app/stat/dto/find-all-member-stat.dto';
import { FindMemberStatDto } from '@app/stat/dto/find-member-stat.dto';
import { StatsMemberUtil } from '@app/stat/utils/stats-member.util';
import { MemberRole } from '@app/types/common/base.type';
import { StatType } from '@app/types/stat/stat.type';

interface StatData {
  memberId: string;
  contentTotalDuration: string | number;
  contentCount: string | number;
  llmTotalToken: string | number;
  llmCount: string | number;
}

interface StatsMap {
  [key: string]: {
    contentTotalDuration: number;
    contentCount: number;
    llmTotalToken: number;
    llmCount: number;
  };
}

interface CountResult {
  count: string;
}

interface MemberStatResult {
  _date: string;
  stats: Array<{
    contentTotalDuration: number;
    contentCount: number;
    llmTotalToken: number;
    llmCount: number;
    [key: string]: any;
  }>;
}

interface MemberQueryResult {
  memberId: string;
  pid: string;
  role: string;
  memberCreateAt: Date;
  workspaceId: string;
  workspaceName: string;
  workspaceDomain: string;
  memberMaxCount: number;
  guestMaxCount: number;
  userLastLogin: Date | null;
  userCreateAt: Date;
  userName: string | null;
  userEmail: string | null;
  userNickName: string | null;
  userThumbnailUrl: string | null;
}

interface MemberResult {
  id: string;
  workspaceId: string;
}

@Injectable()
export class MemberStatsRepository {
  private readonly logger = new Logger(MemberStatsRepository.name);

  constructor(
    private dataSource: DataSource,
    private readonly statsMemberUtil: StatsMemberUtil,
  ) {}

  private generateDefaultStats() {
    return {
      contentTotalDuration: 0,
      contentCount: 0,
      llmTotalToken: 0,
      llmCount: 0,
    };
  }

  async checkWorkspaceExists(workspaceId: string): Promise<void> {
    const workspace = await this.dataSource
      .createQueryBuilder()
      .select('w.id')
      .from('Workspace', 'w')
      .where('w.id = :workspaceId', { workspaceId })
      .getOne();

    if (!workspace) {
      this.logger.warn(`Workspace not found. (ID: ${workspaceId})`);
      throw new NotFoundException(`Workspace not found. (ID: ${workspaceId})`);
    }
  }

  async getMemberById(memberId: string): Promise<MemberResult> {
    const member = await this.dataSource
      .createQueryBuilder()
      .select('m.id', 'id')
      .addSelect('m.workspaceId', 'workspaceId')
      .from('Member', 'm')
      .where('m.id = :memberId', { memberId })
      .getRawOne<MemberResult>();

    if (!member) {
      this.logger.warn(`Member not found. (ID: ${memberId})`);
      throw new NotFoundException(`Member not found. (ID: ${memberId})`);
    }

    return member;
  }

  async findAllMemberStatsByWorkspaceId(
    workspaceId: string,
    options: FindAllMemberStatDto,
  ) {
    try {
      await this.checkWorkspaceExists(workspaceId);

      const {
        type = StatType.DAILY,
        date = new Date().toISOString().substring(0, 10),
        page = 1,
        row = 10,
      } = options;

      // 1. 총 멤버 수 조회
      const totalCountQuery = this.dataSource
        .createQueryBuilder()
        .select('COUNT(m.id)', 'count')
        .from('Member', 'm')
        .where('m.workspaceId = :workspaceId', { workspaceId });

      const totalCountResult = await totalCountQuery.getRawOne<CountResult>();
      const totalCount = totalCountResult
        ? parseInt(totalCountResult.count, 10)
        : 0;

      if (totalCount === 0) {
        return {
          _date: date,
          _count: 0,
          _pageCount: 0,
          members: [],
        };
      }

      // 2. 멤버 정보 조회
      const membersQuery = this.dataSource
        .createQueryBuilder()
        .select('m.id', 'memberId')
        .addSelect('m.pid', 'pid')
        .addSelect('m.role', 'role')
        .addSelect('m.createAt', 'memberCreateAt')
        .addSelect('w.id', 'workspaceId')
        .addSelect('w.name', 'workspaceName')
        .addSelect('w.domain', 'workspaceDomain')
        .addSelect('wc.memberMaxCount', 'memberMaxCount')
        .addSelect('wc.guestMaxCount', 'guestMaxCount')
        .addSelect('u.lastLogin', 'userLastLogin')
        .addSelect('u.createAt', 'userCreateAt')
        .addSelect('up.name', 'userName')
        .addSelect('up.email', 'userEmail')
        .addSelect('up.nickName', 'userNickName')
        .addSelect('up.thumbnailUrl', 'userThumbnailUrl')
        .from('Member', 'm')
        .leftJoin('Workspace', 'w', 'w.id = m.workspaceId')
        .leftJoin('WorkspaceConfig', 'wc', 'wc.workspaceId = w.id')
        .leftJoin('User', 'u', 'u.pid = m.pid')
        .leftJoin('UserProfile', 'up', 'up.pid = u.pid')
        .where('m.workspaceId = :workspaceId', { workspaceId })
        .orderBy('m.createAt', 'DESC')
        .offset((page - 1) * row)
        .limit(row);

      const members = await membersQuery.getRawMany<MemberQueryResult>();

      // 3. 멤버 ID 목록 추출
      const memberIds = members.map((m: MemberQueryResult) => m.memberId);

      if (memberIds.length === 0) {
        return {
          _date: date,
          _count: totalCount,
          _pageCount: Math.ceil(totalCount / row),
          members: [],
        };
      }

      // 4. 통계 정보 조회
      const queryOptions = this.statsMemberUtil.getQueryOptions(type, date);
      const entityName = this.statsMemberUtil.getEntityByType(type);

      const statsQuery = this.dataSource
        .createQueryBuilder()
        .select('s.memberId', 'memberId')
        .addSelect('s.contentTotalDuration', 'contentTotalDuration')
        .addSelect('s.contentCount', 'contentCount')
        .addSelect('s.llmTotalToken', 'llmTotalToken')
        .addSelect('s.llmCount', 'llmCount')
        .from(entityName, 's')
        .where('s.memberId IN (:...memberIds)', { memberIds });

      // 날짜 조건 추가
      if (queryOptions.where) {
        Object.entries(queryOptions.where).forEach(([key, value]) => {
          statsQuery.andWhere(`s.${key} = :${key}`, { [key]: value });
        });
      }

      const stats = await statsQuery.getRawMany();

      // 5. 멤버 ID를 키로 하는 통계 맵 생성
      const statsMap = stats.reduce<StatsMap>((acc, stat: StatData) => {
        acc[stat.memberId] = {
          contentTotalDuration:
            parseInt(String(stat.contentTotalDuration), 10) || 0,
          contentCount: parseInt(String(stat.contentCount), 10) || 0,
          llmTotalToken: parseInt(String(stat.llmTotalToken), 10) || 0,
          llmCount: parseInt(String(stat.llmCount), 10) || 0,
        };
        return acc;
      }, {});

      // 6. 멤버 정보와 통계 정보 결합
      const formattedMembers = members.map((member: MemberQueryResult) => {
        return {
          id: member.memberId,
          role: member.role as MemberRole,
          workspace: {
            id: member.workspaceId,
            name: member.workspaceName,
            domain: member.workspaceDomain,
            config: {
              allowGuest: member.guestMaxCount > 0,
              allowShare: true,
            },
          },
          user: {
            pid: member.pid,
            lastLogin: member.userLastLogin,
            createAt: member.userCreateAt,
            profile: {
              name: member.userName || null,
              email: member.userEmail || null,
              nickName: member.userNickName || null,
              thumbnailUrl: member.userThumbnailUrl || null,
            },
          },
          stats: statsMap[member.memberId] || this.generateDefaultStats(),
        };
      });

      return {
        _date: date,
        _count: totalCount,
        _pageCount: Math.ceil(totalCount / row),
        members: formattedMembers,
      };
    } catch (error) {
      this.logger.error(
        `Error occurred while fetching member statistics:
        ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async checkMemberExists(memberId: string): Promise<void> {
    const member = await this.dataSource
      .createQueryBuilder()
      .select('m.id')
      .from('Member', 'm')
      .where('m.id = :memberId', { memberId })
      .getOne();

    if (!member) {
      this.logger.warn(`Member not found. (ID: ${memberId})`);
      throw new NotFoundException(`Member not found. (ID: ${memberId})`);
    }
  }

  async findStatByMemberId(
    memberId: string,
    options: FindMemberStatDto,
  ): Promise<MemberStatResult> {
    try {
      const {
        type = StatType.HOURLY,
        date = new Date().toISOString().substring(0, 10),
      } = options;

      await this.checkMemberExists(memberId);

      // 쿼리 옵션 및 엔티티명 가져오기
      const queryOptions = this.statsMemberUtil.getQueryOptions(type, date);
      const entityName = this.statsMemberUtil.getEntityByType(type);

      // 통계 정보 조회
      const statsQuery = this.dataSource
        .createQueryBuilder()
        .from(entityName, 's')
        .where('s.memberId = :memberId', { memberId });

      // 날짜 조건 추가
      if (queryOptions.where) {
        Object.entries(queryOptions.where).forEach(([key, value]) => {
          statsQuery.andWhere(`s.${key} = :${key}`, { [key]: value });
        });
      }

      // 정렬 조건 추가
      if (queryOptions.orderBy) {
        Object.entries(queryOptions.orderBy).forEach(([key, value]) => {
          statsQuery.orderBy(`s.${key}`, value as 'ASC' | 'DESC');
        });
      }

      // 타입에 따라 필요한 필드 선택
      switch (type) {
        case StatType.HOURLY:
          statsQuery
            .select('s.hour', 'hour')
            .addSelect('s.contentTotalDuration', 'contentTotalDuration')
            .addSelect('s.contentCount', 'contentCount')
            .addSelect('s.llmTotalToken', 'llmTotalToken')
            .addSelect('s.llmCount', 'llmCount');
          break;
        case StatType.DAILY:
          statsQuery
            .select('s.date', 'date')
            .addSelect('s.contentTotalDuration', 'contentTotalDuration')
            .addSelect('s.contentCount', 'contentCount')
            .addSelect('s.llmTotalToken', 'llmTotalToken')
            .addSelect('s.llmCount', 'llmCount');
          break;
        case StatType.WEEKLY:
          statsQuery
            .select('s.week', 'week')
            .addSelect('s.contentTotalDuration', 'contentTotalDuration')
            .addSelect('s.contentCount', 'contentCount')
            .addSelect('s.llmTotalToken', 'llmTotalToken')
            .addSelect('s.llmCount', 'llmCount');
          break;
        case StatType.MONTHLY:
          statsQuery
            .select('s.month', 'month')
            .addSelect('s.contentTotalDuration', 'contentTotalDuration')
            .addSelect('s.contentCount', 'contentCount')
            .addSelect('s.llmTotalToken', 'llmTotalToken')
            .addSelect('s.llmCount', 'llmCount');
          break;
      }

      // 통계 데이터 조회
      const stats = await statsQuery.getRawMany<Record<string, any>>();

      let formattedDate = date;
      switch (type) {
        // yyyy-mm-dd
        case StatType.HOURLY:
          break;
        // yyyy-mm
        case StatType.DAILY:
        case StatType.WEEKLY:
          formattedDate = date.substring(0, 7);
          break;
        // yyyy
        case StatType.MONTHLY:
          formattedDate = date.substring(0, 4);
          break;
      }

      return {
        _date: formattedDate,
        stats: stats.map((stat: Record<string, any>) => ({
          ...stat,
          contentTotalDuration:
            parseInt(String(stat.contentTotalDuration), 10) || 0,
          contentCount: parseInt(String(stat.contentCount), 10) || 0,
          llmTotalToken: parseInt(String(stat.llmTotalToken), 10) || 0,
          llmCount: parseInt(String(stat.llmCount), 10) || 0,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Error occurred while retrieving member statistics:
        ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
