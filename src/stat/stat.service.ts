import { Injectable, ForbiddenException, Logger } from '@nestjs/common';

import {
  FindAllMemberStatDto,
  MemberStatListResponseDto,
} from '@app/stat/dto/find-all-member-stat.dto';
import {
  FindAllWorkspaceStatDto,
  WorkspaceStatItemDto,
} from '@app/stat/dto/find-all-workspace-stat.dto';
import {
  FindMemberStatDto,
  MemberStatResponseDto,
} from '@app/stat/dto/find-member-stat.dto';
import { MemberStatsRepository } from '@app/stat/repositories/member-stats.repository';
import { MonthlyWorkspaceStatsRepository } from '@app/stat/repositories/monthly-workspace-stats.repository';
import { MemberRole } from '@app/types/common/base.type';

@Injectable()
export class StatService {
  private readonly logger = new Logger(StatService.name);

  constructor(
    private readonly monthlyWorkspaceStatsRepository: MonthlyWorkspaceStatsRepository,
    private readonly memberStatsRepository: MemberStatsRepository,
  ) {}

  async findAllWorkspaceStats(
    workspace: { id: string; domain: string },
    paramDomain: string,
    query: FindAllWorkspaceStatDto,
  ): Promise<WorkspaceStatItemDto[]> {
    const year = query.year || new Date().getFullYear().toString();
    const domain = paramDomain || workspace.domain;

    this.logger.debug(
      `Fetching workspace stats for workspace ${workspace.id}, domain ${domain}, year ${year}`,
    );

    const stats =
      await this.monthlyWorkspaceStatsRepository.findAllWorkspaceStats({
        year,
        domain,
      });

    this.logger.log(
      `Retrieved ${stats.length} workspace stats for domain ${domain} in year ${year}`,
    );

    return stats;
  }

  async findAllMemberStatsByWorkspaceId(
    workspaceId: string,
    options: FindAllMemberStatDto,
  ): Promise<MemberStatListResponseDto> {
    this.logger.debug(
      `Fetching member stats for workspace ${workspaceId} with options: ${JSON.stringify(
        options,
      )}`,
    );

    const result =
      await this.memberStatsRepository.findAllMemberStatsByWorkspaceId(
        workspaceId,
        options,
      );

    this.logger.log(
      `Retrieved stats for ${result.members.length} members out of ${result._count} total members in workspace ${workspaceId}`,
    );

    return new MemberStatListResponseDto(
      result._date,
      result._count,
      result._pageCount,
      result.members,
    );
  }

  async findStatByMemberId(
    currentUser: { id: string; workspaceId: string; role: MemberRole },
    memberId: string,
    options: FindMemberStatDto,
  ): Promise<MemberStatResponseDto> {
    this.logger.debug(
      `User ${currentUser.id} requesting stats for member ${memberId} with options: ${JSON.stringify(
        options,
      )}`,
    );

    const member = await this.memberStatsRepository.getMemberById(memberId);

    // 권한 확인: ADMIN이 아니고 다른 워크스페이스의 멤버 통계를 조회하려는 경우
    if (
      currentUser.role !== MemberRole.ADMIN &&
      member.workspaceId !== currentUser.workspaceId
    ) {
      this.logger.warn(
        `User ${currentUser.id} with role ${currentUser.role} attempted to access stats for member ${memberId} in workspace ${member.workspaceId}`,
      );
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    const result = await this.memberStatsRepository.findStatByMemberId(
      memberId,
      options,
    );

    this.logger.log(
      `Retrieved ${result.stats.length} stat entries for member ${memberId}`,
    );

    return new MemberStatResponseDto(result._date, result.stats);
  }
}
