import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { Workspace } from '@app/workspace/entities/workspace.entity';

@Injectable()
export class WorkspaceRepository extends Repository<Workspace> {
  constructor(private dataSource: DataSource) {
    super(Workspace, dataSource.createEntityManager());
  }

  async findWorkspaceById(workspaceId: string) {
    return this.findOne({ where: { id: workspaceId } });
  }
}
