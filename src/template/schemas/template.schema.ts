import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { applyCommonSchemaOptions } from '@app/common/utils/mongo-schema.util';
import { YesNo } from '@app/types/common/base.type';
import { Module } from '@app/types/template/template.type';

export type TemplateDocument = HydratedDocument<Template>;

@Schema({ collection: 'Template' })
export class Template {
  @Prop({ default: () => uuidv4() })
  _id: string;

  @Prop()
  workspaceId: string;

  @Prop({ default: '' })
  version: string;

  @Prop()
  title: string;

  @Prop({ type: Array<Module> })
  template: Module[]; // 초기 설계시 변수명을 잘 못 지음. template -> modules라고 하는 게 더 적합할듯(but 당장은 프론트와 맞추기 위해 수정하지 않음)

  @Prop({ default: '' })
  description: string;

  @Prop()
  creatorPID: string;

  @Prop()
  editorPID: string;

  @Prop()
  preview: string;

  @Prop({ type: String, enum: YesNo, default: YesNo.N })
  isUsed: YesNo;

  @Prop({ type: String, enum: YesNo, default: YesNo.N })
  isDeleted: YesNo;

  @Prop({ default: Date.now })
  createAt: Date;

  @Prop({ default: Date.now })
  updateAt: Date;
}

const TemplateSchema = SchemaFactory.createForClass(Template);

applyCommonSchemaOptions(TemplateSchema);

export { TemplateSchema };
