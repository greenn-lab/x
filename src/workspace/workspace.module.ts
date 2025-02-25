import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceConfig } from '@app/workspace/entities/workspace-config.entity';
import { Workspace } from '@app/workspace/entities/workspace.entity';
import { WorkspaceRepository } from '@app/workspace/repositories/workspace.repository';
import { WorkspaceController } from '@app/workspace/workspace.controller';
import { WorkspaceService } from '@app/workspace/workspace.service';
@Module({
  imports: [TypeOrmModule.forFeature([Workspace, WorkspaceConfig])],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceRepository],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
