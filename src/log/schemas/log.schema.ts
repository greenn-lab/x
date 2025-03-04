import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

export type LogDocument = HydratedDocument<Log>;

export interface logTransaction {
  data: string;
  message: string;
}

@Schema({
  collection: 'ClientErrorLog',
  versionKey: false,
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Log {
  @Prop()
  email: string;

  @Prop()
  group: string;

  @Prop({ type: Array, default: [] })
  transaction: logTransaction[]; // JSON 배열을 저장하기 위한 타입

  @Prop({ default: Date.now })
  createAt: Date;
}

export const LogSchema = SchemaFactory.createForClass(Log);

// 가상 속성 추가
LogSchema.virtual('id').get(function () {
  return this._id.toString();
});

// _id 필드 숨기기 및 id를 가장 먼저 표시
LogSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    const id: string = (ret._id as unknown as string).toString();
    delete ret._id;

    // 새 객체를 만들어 id를 첫 번째 필드로 배치
    return {
      id,
      ...ret,
    };
  },
});
