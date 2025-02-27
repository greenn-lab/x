import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { TemplateModule } from '@app/template/schemas/template-module.schema';
import { Module } from '@app/types/template/template.type';

@Injectable()
export class TemplateModuleRepository {
  constructor(
    @InjectModel(TemplateModule.name)
    private templateModule: Model<TemplateModule>,
  ) {}

  // 템플릿 모듈 조회
  async getTemplateModules(
    workspaceId: string,
  ): Promise<TemplateModule | null> {
    return await this.templateModule
      .findOne({ workspaceId })
      .sort({ createAt: -1 });
    // .lean() 을 쓰면 _id 가 무조건 나옴
  }

  // 템플릿 모듈 생성
  async createTemplateModules(data: {
    workspaceId: string;
    modules: Module[];
  }): Promise<TemplateModule> {
    return await this.templateModule.create(data);
  }
}
