import { Controller, Get, Query, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { Roles } from '@app/common/decorators/roles.decorator';
import { Workspace } from '@app/common/decorators/workspace.decorator';
import { ResponseDto } from '@app/common/dto/response.dto';
import { FindAllMemberStatDto } from '@app/stat/dto/find-all-member-stat.dto';
import { FindAllWorkspaceStatDto } from '@app/stat/dto/find-all-workspace-stat.dto';
import { FindMemberStatDto } from '@app/stat/dto/find-member-stat.dto';
import { StatService } from '@app/stat/stat.service';
import { MemberRole } from '@app/types/common/base.type';
import { AuthenticatedRequest } from '@app/types/common/request.type';

@ApiTags('Stat')
@Controller('stat')
export class StatController {
  constructor(private readonly statService: StatService) {}

  @Get(['members', ':workspaceId/members'])
  @Roles(MemberRole.MEMBER)
  @ApiOperation({ summary: 'Get member statistics by workspace' })
  async findAllMemberStats(
    @Workspace() workspace: { id: string; domain: string },
    @Param('workspaceId') workspaceId: string,
    @Query() query: FindAllMemberStatDto,
  ) {
    const targetWorkspaceId = workspaceId || workspace.id;

    const result = await this.statService.findAllMemberStatsByWorkspaceId(
      targetWorkspaceId,
      query,
    );
    return ResponseDto.success(result);
  }

  @Get('member/:memberId')
  @Roles(MemberRole.MEMBER)
  @ApiOperation({ summary: 'Get member statistics by member ID' })
  async findStatByMemberId(
    @Workspace() workspace: { id: string; domain: string },
    @Req() req: AuthenticatedRequest,
    @Param('memberId') memberId: string,
    @Query() query: FindMemberStatDto,
  ) {
    const currentUser = {
      id: req.auth?.member?.id || '',
      workspaceId: workspace.id,
      role: req.auth?.member?.role || MemberRole.MEMBER,
    };

    const result = await this.statService.findStatByMemberId(
      currentUser,
      memberId,
      query,
    );
    return ResponseDto.success(result);
  }

  @Get(['', ':domain'])
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Get workspace statistics' })
  async findAllWorkspaceStats(
    @Workspace() workspace: { id: string; domain: string },
    @Param('domain') domain: string,
    @Query() query: FindAllWorkspaceStatDto,
  ) {
    const result = await this.statService.findAllWorkspaceStats(
      workspace,
      domain,
      query,
    );
    return ResponseDto.success(result);
  }
}
