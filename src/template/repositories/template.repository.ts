import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import {
  transformMongoDocument,
  transformMongoDocuments,
} from '@app/common/utils/transform-mongo.util';
import { CreateTemplateDtoPlus } from '@app/template/dto/create-template.dto';
import { GetTemplatesDto } from '@app/template/dto/get-templates.dto';
import {
  OptionsDto,
  UpdateTemplateDtoPlus,
} from '@app/template/dto/update-template.dto';
import { TemplateRevision } from '@app/template/schemas/template-revision.schema';
import { Template } from '@app/template/schemas/template.schema';
import { YesNo } from '@app/types/common/base.type';

@Injectable()
export class TemplateRepository {
  constructor(
    @InjectModel(Template.name) private template: Model<Template>,
    @InjectModel(TemplateRevision.name)
    private templateRevision: Model<TemplateRevision>,
  ) {}

  // 사용중인 템플릿 개수 조회
  async getUsingTemplateCount(workspaceId: string): Promise<number> {
    return await this.template.countDocuments({ workspaceId, isUsed: true });
  }

  // 템플릿 목록 조회
  async getTemplates(
    workspaceId: string,
    options: GetTemplatesDto,
  ): Promise<{ _count: number; templates }> {
    const query = { workspaceId };

    if (options.isUsed) {
      query['isUsed'] = options.isUsed;
    }
    if (options.isDeleted) {
      query['isDeleted'] = options.isDeleted;
    }

    const [templatesResult, _count] = await Promise.all([
      this.template.find(query).sort({ isUsed: -1, updatedAt: -1 }).lean(),
      this.template.countDocuments(query),
    ]);

    const templates = transformMongoDocuments(templatesResult);

    return { _count, templates };
  }

  // 템플릿 생성
  async createTemplate(data: CreateTemplateDtoPlus) {
    const session = await this.template.startSession();
    try {
      const templateDoc: Template = await session.withTransaction(async () => {
        const newTemplate = new this.template({ ...data });

        if (!newTemplate) {
          throw new Error('템플릿 생성 실패');
        }

        const restData = { ...data, templateId: newTemplate._id.toString() };

        const newRevision = new this.templateRevision(restData);

        await newTemplate.save({ session });
        await newRevision.save({ session });

        const savedTemplate = await this.template
          .findById(newTemplate._id)
          .session(session)
          .lean()
          .exec();

        if (!savedTemplate) {
          throw new Error('생성된 템플릿을 찾을 수 없습니다');
        }

        return savedTemplate;
      });

      return transformMongoDocument(templateDoc);
    } catch (error) {
      console.error('트랜잭션 중 오류 발생:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('알 수 없는 오류가 발생했습니다');
    } finally {
      await session.endSession();
    }
  }

  // 템플릿 상세 조회
  async getTemplateDetail(workspaceId: string, templateId: string) {
    const template = await this.template
      .findOne({
        workspaceId,
        _id: templateId,
      })
      .lean()
      .exec();

    if (!template) {
      return null;
    }

    return transformMongoDocument(template);
  }

  // 템플릿 수정
  async updateTemplate(templateId: string, dto: UpdateTemplateDtoPlus) {
    const { preview, ...updateData } = dto;
    const session = await this.template.startSession();

    try {
      let updatedTemplate: Template | null = null;

      await session.withTransaction(async () => {
        // findOneAndUpdate를 사용하여 템플릿 업데이트
        updatedTemplate = await this.template
          .findOneAndUpdate(
            { _id: templateId },
            { $set: { ...updateData, preview } },
            { new: true, session },
          )
          .lean();

        if (!updatedTemplate) {
          throw new Error(`템플릿 ID ${templateId}를 찾을 수 없습니다.`);
        }

        // 새 리비전 생성
        const newRevision = new this.templateRevision({
          ...updateData,
          templateId,
        });

        await newRevision.save({ session });
      });

      // 세션 종료 후 변환된 문서 반환
      await session.endSession();

      if (!updatedTemplate) {
        throw new Error(`수정에 실패하였습니다`);
      }

      return transformMongoDocument(updatedTemplate);
    } catch (error) {
      console.error('템플릿 업데이트 중 오류 발생:', error);
      await session.endSession();
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('알 수 없는 오류가 발생했습니다');
    }
  }

  // 템플릿 사용 여부 수정
  async updateTemplateStatus(templateId: string, options: OptionsDto) {
    const { isUsed, isDeleted } = options;
    const data: Record<string, YesNo> = {};
    if (isUsed) {
      data['isUsed'] = isUsed as YesNo;
    }
    if (isDeleted) {
      data['isDeleted'] = isDeleted as YesNo;
    }

    const result = await this.template
      .findOneAndUpdate({ _id: templateId }, { $set: data }, { new: true })
      .lean();

    return result ? transformMongoDocument(result) : null;
  }
}
