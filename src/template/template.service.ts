import { Injectable, Logger } from '@nestjs/common';

import { GetTemplatesDto } from '@app/template/dto/get-templates.dto';
import { TemplateRepository } from '@app/template/repositories/template.repository';
import { Template } from '@app/template/schemas/template.schema';
import { TemplateWithUsernames } from '@app/types/template/template.type';
import { UserViewRepository } from '@app/user/repositories/user-view.repository';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(
    private templateRepository: TemplateRepository,
    private readonly userViewRepository: UserViewRepository,
  ) {}

  // pid -> nickname으로 대체
  async replacePIDsWithNicknames(
    templates: Template[],
  ): Promise<TemplateWithUsernames[]> {
    // 	// 1. pid들 추출
    const pidsSet = new Set<string>();
    templates.forEach(({ creatorPID, editorPID }) => {
      pidsSet.add(creatorPID);
      if (editorPID !== creatorPID) {
        pidsSet.add(editorPID);
      }
    });

    // 2. 사용자 정보 조회
    const usersInfo = await this.userViewRepository.getUserNickNames(
      Array.from(pidsSet),
    );

    const userMap = new Map(usersInfo.map((user) => [user.pid, user.nickName]));

    // 3. 닉네임 매핑 (기본값 추가)
    return templates.map(({ creatorPID, editorPID, ...templateData }) => ({
      creator: userMap.get(creatorPID) ?? 'Unknown User',
      editor: userMap.get(editorPID) ?? 'Unknown User',
      ...templateData,
    }));
  }

  async getTemplates(
    workspaceId: string,
    options: GetTemplatesDto,
  ): Promise<{ _count: number; templates: TemplateWithUsernames[] }> {
    try {
      this.logger.log(`템플릿 조회를 시작합니다`);
      const templatesInfo = await this.templateRepository.getTemplates(
        workspaceId,
        options,
      );

      const mappedTemplates = await this.replacePIDsWithNicknames(
        templatesInfo.templates,
      );

      this.logger.log(`템플릿 조회를 완료했습니다`);
      return {
        _count: templatesInfo._count,
        templates: mappedTemplates,
      };
    } catch (error) {
      this.logger.error(`템플릿 조회 중 오류가 발생했습니다`);
      throw error;
    }
  }
}
