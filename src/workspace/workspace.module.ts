import { Module } from '@nestjs/common';

import { MemberRepository } from '@app/member/repositories/member.repository';
import { WorkspaceConfigRepository } from '@app/workspace/repositories/workspace-config.repository';
import { WorkspaceRepository } from '@app/workspace/repositories/workspace.repository';
import { WorkspaceController } from '@app/workspace/workspace.controller';
import { WorkspaceService } from '@app/workspace/workspace.service';

@Module({
  controllers: [WorkspaceController],
  providers: [
    WorkspaceService,
    WorkspaceRepository,
    WorkspaceConfigRepository,
    MemberRepository,
  ],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
