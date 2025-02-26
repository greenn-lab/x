import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { YesNo } from '@app/types/common/base.type';
import { Module } from '@app/types/template/template.type';

export type TemplateDocument = HydratedDocument<Template>;

@Schema({ collection: 'Template', timestamps: true })
export class Template {
  @Prop({ default: uuidv4 })
  _id: string;

  @Prop()
  workspaceId: string;

  @Prop({ default: '' })
  version: string;

  @Prop()
  title: string;

  @Prop({ type: Array<Module> })
  template: Module[];

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

export const TemplateSchema = SchemaFactory.createForClass(Template);
