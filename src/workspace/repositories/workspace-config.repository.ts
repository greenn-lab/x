import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { WorkspaceConfig } from '@app/workspace/entities/workspace-config.entity';

@Injectable()
export class WorkspaceConfigRepository extends Repository<WorkspaceConfig> {
  constructor(private dataSource: DataSource) {
    super(WorkspaceConfig, dataSource.createEntityManager());
  }

  async findWorkspaceConfigById(workspaceId: string) {
    return this.findOne({ where: { workspaceId: workspaceId } });
  }

  async updateStatus(workspaceId: string, workspaceConfig: WorkspaceConfig) {
    const result = await this.update(
      { workspaceId },
      { disableAt: workspaceConfig.disableAt ? null : new Date() },
    );

    if (result.affected === 0)
      throw new Error('Update failed: No rows affected');

    return this.findOne({
      where: { workspaceId },
      select: ['workspaceId', 'disableAt'],
    });
  }
}
