import { Injectable } from '@nestjs/common';

import { WorkspaceRepository } from '@app/workspace/repositories/workspace.repository';
@Injectable()
export class WorkspaceService {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async getWorkspace(workspaceId: string) {
    return this.workspaceRepository.findWorkspaceById(workspaceId);
  }
}
