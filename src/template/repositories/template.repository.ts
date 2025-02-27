import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { CreateTemplateDtoPlus } from '@app/template/dto/create-template.dto';
import { GetTemplatesDto } from '@app/template/dto/get-templates.dto';
import { TemplateRevision } from '@app/template/schemas/template-revision.schema';
import { Template } from '@app/template/schemas/template.schema';

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
  ): Promise<{ _count: number; templates: Template[] }> {
    const query = { workspaceId };

    if (options.isUsed) {
      query['isUsed'] = options.isUsed;
    }
    if (options.isDeleted) {
      query['isDeleted'] = options.isDeleted;
    }

    const [templates, _count] = await Promise.all([
      this.template
        .find(query)
        .lean()
        .sort({ isUsed: -1, updatedAt: -1 })
        .exec(),
      this.template.countDocuments(query),
    ]);

    return {
      _count,
      templates,
    };
  }
  // 템플릿 생성
  async createTemplate(data: CreateTemplateDtoPlus): Promise<Template> {
    const session = await this.template.startSession();
    try {
      const templateDoc = await session.withTransaction(async () => {
        const newTemplate = new this.template({ ...data });

        if (!newTemplate) {
          throw new Error('템플릿 생성 실패');
        }

        const restData = { ...data, templateId: newTemplate._id.toString() };

        const newRevision = new this.templateRevision(restData);

        await newTemplate.save({ session });
        await newRevision.save({ session });

        return newTemplate;
      });

      return templateDoc;
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
}
