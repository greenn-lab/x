import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TemplateModuleRepository } from '@app/template/repositories/template-module.repository';
import { TemplateRepository } from '@app/template/repositories/template.repository';
import {
  TemplateModule as TemplateModuleSchema,
  TemplateModuleSchema as TemplateModuleSchemaFactory,
} from '@app/template/schemas/template-module.schema';
import {
  TemplateRevision,
  TemplateRevisionSchema,
} from '@app/template/schemas/template-revision.schema';
import {
  Template,
  TemplateSchema,
} from '@app/template/schemas/template.schema';
import { TemplateController } from '@app/template/template.controller';
import { TemplateService } from '@app/template/template.service';
import { TemplateProcessorUtil } from '@app/template/utils/template-processor.util';
import { UserView } from '@app/user/entities/user-view.entity';
import { User } from '@app/user/entities/user.entity';
import { UserViewRepository } from '@app/user/repositories/user-view.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserView]),
    MongooseModule.forFeature([
      { name: Template.name, schema: TemplateSchema },
      { name: TemplateRevision.name, schema: TemplateRevisionSchema },
      { name: TemplateModuleSchema.name, schema: TemplateModuleSchemaFactory },
    ]),
  ],
  controllers: [TemplateController],
  providers: [
    TemplateService,
    TemplateRepository,
    TemplateModuleRepository,
    UserViewRepository,
    TemplateProcessorUtil,
  ],
  exports: [TemplateService],
})
export class TemplateModule {}
