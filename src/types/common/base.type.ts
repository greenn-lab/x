// 데이터베이스나 시스템 전반에 걸쳐 사용되는 기본적인 type

export enum YesNo {
  Y = 'Y',
  N = 'N',
}

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
}

export enum Provider {
  TIMBLO = 'timblo',
  GOOGLE = 'google',
  APPLE = 'apple',
}

export enum SupportLang {
  NONE = 'none',
  KO = 'ko',
  EN = 'en',
  ENKO = 'enko',
}

export enum Engine {
  CLOVA = 'CLOVA',
  RTZ = 'RTZ',
  HAIV = 'HAIV',
}

export enum Summarizer {
  OPENAI = 'OPENAI',
  SLLM = 'SLLM',
}

export enum BookmarkKeys {
  segments = 'segments',
  speakerInfo = 'speakerInfo',
  summaryTime = 'summaryTime',
  topics = 'topics',
  keywords = 'keywords',
  summary = 'summary',
  tasks = 'tasks',
  issues = 'issues',
}
