import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { Module } from '@app/types/template/template.type';

export type TemplateRevisionDocument = HydratedDocument<TemplateRevision>;

@Schema({
  collection: 'TemplateRevision',
  timestamps: false,
  versionKey: false,
})
export class TemplateRevision {
  @Prop({ default: uuidv4 })
  templateId: string;

  @Prop({ default: '' })
  version: string;

  @Prop()
  title: string;

  @Prop({ type: Array<Module> })
  template: Module[];

  @Prop({ default: '' })
  description: string;

  @Prop()
  editorPID: string;

  @Prop({ default: Date.now })
  createAt: Date;
}

export const TemplateRevisionSchema =
  SchemaFactory.createForClass(TemplateRevision);
