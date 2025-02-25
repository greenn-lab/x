import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { WorkspaceService } from '@app/workspace/workspace.service';

@ApiTags('Workspace')
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get(':workspaceId')
  async getWorkspace(@Param('workspaceId') workspaceId: string) {
    return this.workspaceService.getWorkspace(workspaceId);
  }
}
