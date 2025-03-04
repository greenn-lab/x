import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { CreateWorkspaceDto } from '@app/workspace/dto/create-workspace.dto';
import { FindWorkspaceDto } from '@app/workspace/dto/find-workspace.dto';
import { Workspace } from '@app/workspace/entities/workspace.entity';

@Injectable()
export class WorkspaceRepository extends Repository<Workspace> {
  constructor(private dataSource: DataSource) {
    super(Workspace, dataSource.createEntityManager());
  }

  async findWorkspaceById(workspaceId: string) {
    return this.findOne({
      where: { id: workspaceId },
      relations: ['config'],
    });
  }

  async findWorkspaces(workspaceId: string, query: FindWorkspaceDto) {
    const { row, page = 1, startDate, endDate, keyword } = query;

    const [workspaces, total] = await this.createQueryBuilder('workspace')
      .leftJoinAndSelect('workspace.config', 'config')
      .select()
      .where('workspace.domain != :globalDomain', { globalDomain: 'global' })
      .andWhere(startDate ? 'workspace.createAt >= :startDate' : '1=1', {
        startDate: startDate ? new Date(`${startDate} 00:00:00`) : undefined,
      })
      .andWhere(endDate ? 'workspace.createAt <= :endDate' : '1=1', {
        endDate: endDate ? new Date(`${endDate} 23:59:59`) : undefined,
      })
      .andWhere(keyword ? 'workspace.name LIKE :keyword' : '1=1', {
        keyword: keyword ? `%${keyword}%` : undefined,
      })
      .skip((page - 1) * row)
      .take(row)
      .orderBy('workspace.createAt', 'DESC')
      .getManyAndCount();

    return {
      _count: total,
      _pageCount: Math.ceil(total / row),
      workspaces,
    };
  }

  async createWorkspace(pid: string, body: CreateWorkspaceDto) {
    const { name, domain, description, thumbnailUrl, inviteCode } = body;
    const workspace = this.create({
      name,
      domain,
      description,
      thumbnailUrl,
      inviteCode,
      updateAt: new Date(),
      owner: { pid },
      config: { inviteCode },
    });
    return this.save(workspace);
  }

  async deleteWorkspace(workspaceId: string) {
    return this.delete(workspaceId);
  }

  async updateStatus(
    workspaceId: string,
    { disableAt }: { disableAt: boolean },
  ) {
    return await this.createQueryBuilder()
      .update('WorkspaceConfig')
      .set({ disableAt: disableAt ? null : new Date() })
      .where('workspaceId = :workspaceId', { workspaceId })
      .returning(['workspaceId', 'disableAt'])
      .execute();
  }
}
