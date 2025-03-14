import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { Module } from '@app/types/template/template.type';

export type TemplateModuleDocument = HydratedDocument<TemplateModule>;

@Schema({ collection: 'TemplateModule', versionKey: false, timestamps: false })
export class TemplateModule {
  @Prop({ default: () => uuidv4() })
  _id: string;

  @Prop()
  workspaceId: string;

  @Prop({ type: Array<Module> })
  modules: Module[];

  @Prop({ default: Date.now })
  createAt: Date;

  @Prop({ default: Date.now })
  updateAt: Date;
}

const TemplateModuleSchema = SchemaFactory.createForClass(TemplateModule);

export { TemplateModuleSchema };
