import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { GetTemplatesDto } from '@app/template/dto/get-templates.dto';
import { Template } from '@app/template/schemas/template.schema';

@Injectable()
export class TemplateRepository {
  constructor(@InjectModel(Template.name) private template: Model<Template>) {}

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
}
