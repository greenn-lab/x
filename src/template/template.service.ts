import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';

import { CreateTemplateDtoPlus } from '@app/template/dto/create-template.dto';
import { GetTemplatesDto } from '@app/template/dto/get-templates.dto';
import {
  StatusDto,
  UpdateTemplateStatusResponseDto,
} from '@app/template/dto/update-template-status.dto';
import { UpdateTemplateDtoPlus } from '@app/template/dto/update-template.dto';
import { TemplateModuleRepository } from '@app/template/repositories/template-module.repository';
import { TemplateRepository } from '@app/template/repositories/template.repository';
import { Template } from '@app/template/schemas/template.schema';
import { TemplateProcessorUtil } from '@app/template/utils/template-processor.util';
import { YesNo } from '@app/types/common/base.type';
import {
  Module,
  TemplateWithUsernames,
} from '@app/types/template/template.type';
import { UserViewRepository } from '@app/user/repositories/user-view.repository';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(
    private templateRepository: TemplateRepository,
    private templateModuleRepository: TemplateModuleRepository,
    private templateProcessor: TemplateProcessorUtil,
    private readonly userViewRepository: UserViewRepository,
  ) {}

  // pid -> nickname으로 대체
  async replacePIDsWithNicknames(templates: Template[]) {
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
      const templatesInfo: {
        _count: number;
        templates: Template[];
      } = await this.templateRepository.getTemplates(workspaceId, options);

      const { templates, _count } = templatesInfo;
      const mappedTemplates = await this.replacePIDsWithNicknames(templates);

      this.logger.log(`템플릿 조회를 완료했습니다`);
      return { _count, templates: mappedTemplates };
    } catch (error) {
      this.logger.error(`템플릿 조회 중 오류가 발생했습니다`);
      throw error;
    }
  }

  //사용가능한 템플릿 모듈셋 조회
  async getTemplateModules(workspaceId: string) {
    try {
      this.logger.log('템플릿 모듈셋 조회 시작');
      const latestModules =
        await this.templateModuleRepository.getTemplateModules(workspaceId);

      if (!latestModules) {
        const sampleModules = this.templateProcessor.assembleSampleModules();
        const newModules =
          await this.templateModuleRepository.createTemplateModules({
            workspaceId,
            modules: sampleModules,
          });

        this.logger.log('===샘플 템플릿 모듈 생성===');
        return newModules;
      }

      return latestModules;
    } catch (error) {
      this.logger.error('템플릿 모듈셋 조회 중 에러', error);
      throw error;
    }
  }

  // 사용중인 템플릿 개수 조회(10개 초과 여부 체크)
  async checkUsingTemplateCount(workspaceId: string) {
    try {
      const usingTemplateCount =
        await this.templateRepository.getUsingTemplateCount(workspaceId);

      if (usingTemplateCount >= 10) {
        throw new BadRequestException(
          '사용중인 템플릿이 10개를 초과하여 등록할 수 없습니다.',
        );
      }
    } catch (error) {
      this.logger.error('사용 중인 템플릿 개수 조회 중 에러', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        '사용 중인 템플릿 개수 조회 중 에러',
      );
    }
  }

  async createTemplate(
    dto: CreateTemplateDtoPlus,
  ): Promise<{ templateId: string }> {
    try {
      this.logger.log('템플릿 생성 시작');
      const { template, workspaceId } = dto;
      if (dto.isUsed === YesNo.Y) {
        await this.checkUsingTemplateCount(workspaceId);
      }

      const checked = await this.templateProcessor.checkTemplate(
        workspaceId,
        template,
      );

      if (!checked) {
        throw new BadRequestException('약속한 타입으로 구성하여 요청해주세요');
      }

      const preview = this.templateProcessor.processTemplate(template);

      const newDto = { ...dto, preview };
      this.logger.log('템플릿 생성 완료');
      return await this.templateRepository.createTemplate(newDto);
    } catch (error) {
      this.logger.error('템플릿 생성 중 에러', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('템플릿 생성 중 에러');
    }
  }

  // 템플릿 상세 조회
  async getTemplateDetail(
    workspaceId: string,
    templateId: string,
    isModules?: YesNo,
  ) {
    try {
      this.logger.log('템플릿 상세 조회 시작');
      const templateInfo = await this.templateRepository.getTemplateDetail(
        workspaceId,
        templateId,
      );

      if (!templateInfo) {
        throw new NotFoundException('해당 Id에 따른 템플릿을 찾을 수 없습니다');
      }

      const [result] = await this.replacePIDsWithNicknames([
        templateInfo,
      ] as unknown as Template[]);

      if (isModules === YesNo.Y) {
        const modules =
          await this.templateModuleRepository.getTemplateModules(workspaceId);
        return { ...templateInfo, modules: modules?.modules as Module[] };
      } else {
        return result;
      }
    } catch (error) {
      this.logger.error('템플릿 상세 조회 중 에러', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('템플릿 상세 조회 중 에러');
    }
  }

  // 템플릿 수정
  async updateTemplate(templateId: string, dto: UpdateTemplateDtoPlus) {
    try {
      this.logger.log('템플릿 수정 시작');
      const { workspaceId, template } = dto;

      const templateInfo = await this.templateRepository.getTemplateDetail(
        workspaceId,
        templateId,
      );

      if (!templateInfo) {
        throw new NotFoundException('해당 Id에 따른 템플릿을 찾을 수 없습니다');
      }

      dto.preview = this.templateProcessor.processTemplate(template);

      const result = await this.templateRepository.updateTemplate(
        templateId,
        dto,
      );

      if (!result) {
        throw new BadRequestException('템플릿 수정에 실패했습니다');
      }

      this.logger.log('템플릿 수정 완료');

      return result;
    } catch (error) {
      this.logger.error('템플릿 수정 중 에러', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('템플릿 수정 중 에러');
    }
  }

  // 템플릿 사용 여부 수정
  async updateTemplateStatus(
    workspaceId: string,
    templateId: string,
    statusDto?: StatusDto,
  ) {
    try {
      this.logger.log('템플릿 사용 여부 수정 시작');

      if (statusDto?.isUsed === YesNo.Y) {
        await this.checkUsingTemplateCount(workspaceId);
      }

      const templateInfo = await this.templateRepository.getTemplateDetail(
        workspaceId,
        templateId,
      );

      if (!templateInfo) {
        throw new NotFoundException('해당 Id에 따른 템플릿을 찾을 수 없습니다');
      }

      if (templateInfo.isDeleted === YesNo.Y) {
        throw new BadRequestException('이미 삭제된 템플릿 입니다');
      }

      const result = await this.templateRepository.updateTemplateStatus({
        templateId,
        isUsed: statusDto?.isUsed,
        isDeleted: statusDto?.isDeleted,
      });

      if (!result) {
        throw new BadRequestException('템플릿 사용 여부 수정에 실패했습니다');
      }

      this.logger.log('템플릿 사용 여부 수정 완료');

      const responseDto: UpdateTemplateStatusResponseDto = {
        templateId: result.id,
        isUsed: result.isUsed as YesNo,
        isDeleted: result.isDeleted as YesNo,
      };
      return responseDto;
    } catch (error) {
      this.logger.error('템플릿 사용 여부 수정 중 에러', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('템플릿 사용 여부 수정 중 에러');
    }
  }

  // 템플릿 삭제
  async deleteTemplate(
    workspaceId: string,
    templateId: string,
  ): Promise<UpdateTemplateStatusResponseDto> {
    try {
      this.logger.log('템플릿 삭제 시작');

      const templateInfo = await this.templateRepository.getTemplateDetail(
        workspaceId,
        templateId,
      );

      if (!templateInfo) {
        throw new NotFoundException('해당 Id에 따른 템플릿을 찾을 수 없습니다');
      }

      if (templateInfo.isDeleted === YesNo.Y) {
        throw new BadRequestException('이미 삭제된 템플릿입니다');
      }

      const result = await this.templateRepository.updateTemplateStatus({
        templateId,
        isDeleted: YesNo.Y,
      });

      if (!result) {
        throw new BadRequestException('템플릿 삭제에 실패했습니다');
      }

      this.logger.log('템플릿 삭제 완료');
      const { id, isUsed, isDeleted } = result;
      const responseDto: UpdateTemplateStatusResponseDto = {
        templateId: id,
        isUsed: isUsed as YesNo,
        isDeleted: isDeleted as YesNo,
      };
      return responseDto;
    } catch (error) {
      this.logger.error('템플릿 삭제 중 에러', error);
      if (error instanceof HttpException) {
        throw error;
      }
    }
    throw new InternalServerErrorException('템플릿 삭제 중 에러');
  }
}
