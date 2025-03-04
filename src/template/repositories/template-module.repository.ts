import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { transformMongoDocument } from '@app/common/utils/transform-mongo.util';
import { TemplateModule } from '@app/template/schemas/template-module.schema';
import { Module } from '@app/types/template/template.type';

@Injectable()
export class TemplateModuleRepository {
  constructor(
    @InjectModel(TemplateModule.name)
    private templateModule: Model<TemplateModule>,
  ) {}

  // 템플릿 모듈 조회
  async getTemplateModules(workspaceId: string) {
    const result = await this.templateModule
      .findOne({ workspaceId })
      .sort({ createAt: -1 })
      .lean();

    return result ? transformMongoDocument(result) : null;
  }

  // 템플릿 모듈 생성
  async createTemplateModules(data: {
    workspaceId: string;
    modules: Module[];
  }): Promise<TemplateModule> {
    return await this.templateModule.create(data);
  }
}
