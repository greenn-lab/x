import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { applyCommonSchemaOptions } from '@app/common/utils/mongo-schema.util';
import { Module } from '@app/types/template/template.type';

export type TemplateRevisionDocument = HydratedDocument<TemplateRevision>;

@Schema({ collection: 'TemplateRevision' })
export class TemplateRevision {
  @Prop({ default: () => uuidv4() })
  _id: string;

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

const TemplateRevisionSchema = SchemaFactory.createForClass(TemplateRevision);

applyCommonSchemaOptions(TemplateRevisionSchema);

export { TemplateRevisionSchema };
