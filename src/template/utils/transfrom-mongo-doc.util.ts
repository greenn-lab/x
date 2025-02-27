// MongoDB 문서 타입 정의
interface MongoDocument {
  _id: string | { toString(): string };
  [key: string]: any;
}

// 변환된 문서 타입 정의
interface TransformedDocument {
  id: string;
  _id?: undefined;
  [key: string]: any;
}

/**
 * MongoDB 문서를 클라이언트 응답 형식으로 변환합니다.
 * _id를 id로 변환하고 _id 필드를 제거합니다.
 * @param doc MongoDB 문서
 * @returns 변환된 문서
 */
export function transformMongoDocument<T extends MongoDocument>(
  doc: T,
): Omit<T, '_id'> & TransformedDocument {
  if (!doc) return doc as Omit<T, '_id'> & TransformedDocument;

  const { _id, ...rest } = doc;
  return {
    ...rest,
    id:
      typeof _id === 'object' && _id !== null && 'toString' in _id
        ? _id.toString()
        : String(_id),
  } as Omit<T, '_id'> & TransformedDocument;
}

/**
 * MongoDB 문서 배열을 클라이언트 응답 형식으로 변환합니다.
 * @param docs MongoDB 문서 배열
 * @returns 변환된 문서 배열
 */
export function transformMongoDocuments<T extends MongoDocument>(
  docs: T[],
): Array<Omit<T, '_id'> & TransformedDocument> {
  if (!docs) return [];
  return docs.map((doc) => transformMongoDocument(doc));
}
