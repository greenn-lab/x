import {
  MongoTransformingIdDocument,
  MongoTransformingIdDto,
} from '@app/types/common/base.type';

export function transformMongoDocument<T extends MongoTransformingIdDocument>(
  doc: T,
): MongoTransformingIdDto {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

export function transformMongoDocuments<T extends MongoTransformingIdDocument>(
  docs: T[],
): MongoTransformingIdDto[] {
  return docs.map(transformMongoDocument);
}
