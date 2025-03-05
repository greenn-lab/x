import * as crypto from 'crypto';

import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import axios from 'axios';
import * as FormData from 'form-data';

import { MemberRepository } from '@app/member/repositories/member.repository';
import { CreateWorkspaceDto } from '@app/workspace/dto/create-workspace.dto';
import { FindWorkspaceDto } from '@app/workspace/dto/find-workspace.dto';
import { UpdateMaxCountDto } from '@app/workspace/dto/update-max-count.dto';
import { Workspace } from '@app/workspace/entities/workspace.entity';
import { WorkspaceConfigRepository } from '@app/workspace/repositories/workspace-config.repository';
import { WorkspaceRepository } from '@app/workspace/repositories/workspace.repository';

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceConfigRepository: WorkspaceConfigRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  async getWorkspace(workspaceId: string) {
    this.logger.debug(`workspace [${workspaceId}] Get Start`);
    const workspace =
      await this.workspaceRepository.findWorkspaceById(workspaceId);
    if (!workspace) throw new Error('Workspace not found');
    const memberCount = await this.memberRepository.count({
      where: { workspaceId },
    });
    return { ...workspace, memberCount };
  }

  getWorkspaces(workspaceId: string, query: FindWorkspaceDto) {
    this.logger.debug(
      `Fetching workspace ${workspaceId} with query ${JSON.stringify(query)}`,
    );
    return this.workspaceRepository.findWorkspaces(workspaceId, query);
  }

  async create(
    pid: string,
    body: CreateWorkspaceDto,
    file: Express.Multer.File,
    token: string,
  ) {
    this.logger.debug(`Creating workspace ${JSON.stringify(body)}`);
    await this.validation(body.domain, body.name);

    // TODO: 썸네일 업로드 로직 추가
    console.log(file);
    console.log(token);
    body.thumbnailUrl = 'https://example.com/thumbnail.jpg';

    const inviteCode = this.generateInviteCode(body.domain);
    body.inviteCode = inviteCode;
    return await this.workspaceRepository.createWorkspace(pid, body);
  }

  async delete(workspaceId: string) {
    this.logger.debug(`Deleting workspace ${workspaceId}`);
    return this.workspaceRepository.deleteWorkspace(workspaceId);
  }

  async updateStatus(workspaceId: string) {
    this.logger.debug(`Updating status of workspace ${workspaceId}`);
    const workspaceConfig =
      await this.workspaceConfigRepository.findWorkspaceConfigById(workspaceId);
    if (!workspaceConfig) throw new Error('Workspace config not found');
    return this.workspaceConfigRepository.updateStatus(
      workspaceId,
      workspaceConfig,
    );
  }

  async updateMaxMembers(workspaceId: string, body: UpdateMaxCountDto) {
    this.logger.debug(
      `workspace [${workspaceId}] Update MaxCount Start => ${JSON.stringify(body)}`,
    );
    const members =
      await this.memberRepository.findMemberCountByWorkspaceId(workspaceId);
    this.checkMaxCount('MEMBER', body.memberMaxCount, members['MEMBER']);
    this.checkMaxCount('OWNER', body.ownerMaxCount, members['OWNER']);
    this.checkMaxCount('GUEST', body.guestMaxCount, members['GUEST']);
    await this.workspaceConfigRepository.update(workspaceId, body);
    return this.workspaceRepository.findWorkspaceById(workspaceId);
  }

  async updateWorkspaceName(workspaceId: string, body: { name: string }) {
    this.logger.debug(`workspace [${workspaceId}] updateName Start`);
    const existingWorkspaces = await this.workspaceRepository.find({
      where: { name: body.name },
    });
    if (existingWorkspaces.some((workspace) => workspace.name === body.name))
      throw new Error('Workspace name already exists');
    await this.workspaceRepository.update(workspaceId, { name: body.name });
    return this.workspaceRepository.findWorkspaceById(workspaceId);
  }

  async validation(domain: string, name: string) {
    this.logger.debug(
      `workspace [${domain}] validation Domain and Name [${name}]`,
    );
    if (!domain || !name) throw new Error('Domain and name must be provided');
    if (!this.isValidDomainFormat(domain))
      throw new Error('Invalid domain format');
    const workspaces = await this.workspaceRepository.find({
      where: [{ domain }, { name }],
    });
    this.checkWorkspaceExistence(workspaces, domain, name);
    return 'Available for use.';
  }

  async updateThumbnail(
    workspaceId: string,
    file: Express.Multer.File,
    token: string,
  ) {
    this.logger.debug(`workspace [${workspaceId}] updateThumbnail Start`);

    const url = await this.uploadWorkspaceThumbnail(file, token);

    // TODO: url db update
    console.log('thumbnail url', url);
  }

  private async uploadWorkspaceThumbnail(
    file: Express.Multer.File,
    token: string,
  ) {
    const formData = new FormData();
    formData.append('type', 'workspace');
    formData.append('image', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const headers = {
      Authorization: `Bearer ${token}`,
      ...formData.getHeaders(),
    };

    try {
      const {
        data: { data: url },
      } = await axios.request<{ data: string }>({
        headers,
        method: 'POST',
        maxBodyLength: Infinity,
        url:
          this.config.get<string>('HOME_URL', '') +
          this.config.get<string>('THUMBNAIL_UPLOAD_URL', ''),
        data: formData,
      });

      return url;
    } catch {
      throw new HttpException('Upload Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private generateInviteCode(domain: string): string {
    return crypto.createHash('sha256').update(domain).digest('hex').slice(0, 6);
  }

  private checkMaxCount(
    role: string,
    maxCount: number | undefined,
    currentCount: number,
  ) {
    if (maxCount !== undefined && currentCount > maxCount)
      throw new Error(`${role} count exceeds the maximum allowed`);
  }

  private isValidDomainFormat(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  }

  private checkWorkspaceExistence(
    workspaces: Workspace[],
    domain: string,
    name: string,
  ): void {
    if (workspaces.length === 0) return;
    const existingWorkspace = workspaces[0];
    if (existingWorkspace.domain === domain)
      throw new Error('Domain already exists');
    if (existingWorkspace.name === name) throw new Error('Name already exists');
    throw new Error('Domain or name already exists');
  }
}
