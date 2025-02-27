import { Schema } from 'mongoose';

/**
 * MongoDB 스키마에 _id를 id로 변환하는 toJSON 변환기를 적용합니다.
 * @param schema 변환기를 적용할 Mongoose 스키마
 * @returns 변환기가 적용된 스키마
 */
export function applyIdTransform<T extends Schema>(schema: T): T {
  schema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
      const { _id, ...rest } = ret;
      if (_id) {
        return { id: String(_id), ...rest };
      }
      return ret;
    },
  });

  return schema;
}

/**
 * MongoDB 스키마에 타임스탬프 처리와 _id를 id로 변환하는 등
 * 공통적으로 필요한 설정을 모두 적용합니다.
 * @param schema 설정을 적용할 Mongoose 스키마
 * @returns 설정이 적용된 스키마
 */
export function applyCommonSchemaOptions<T extends Schema>(schema: T): T {
  // 타임스탬프 설정
  schema.set('timestamps', false);

  // ID 변환 설정
  applyIdTransform(schema);

  // 버전 키 비활성화
  schema.set('versionKey', false);

  return schema;
}
