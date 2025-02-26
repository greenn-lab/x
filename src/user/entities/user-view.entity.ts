import { ViewEntity, ViewColumn } from 'typeorm';

import {
  Provider,
  SupportLang,
  Engine,
  Summarizer,
} from '@app/types/common/base.type';

@ViewEntity({
  name: 'UserView',
})
export class UserView {
  @ViewColumn()
  pid: string;

  @ViewColumn()
  domain?: string;

  @ViewColumn()
  provider: Provider;

  @ViewColumn()
  lastLogin?: Date;

  @ViewColumn()
  name?: string;

  @ViewColumn()
  nickName: string;

  @ViewColumn()
  email?: string;

  @ViewColumn()
  thumbnailUrl: string;

  @ViewColumn()
  statusMessage?: string;

  @ViewColumn()
  locale: SupportLang;

  @ViewColumn()
  transcribeLang: SupportLang;

  @ViewColumn()
  transcribeEngine: Engine;

  @ViewColumn()
  summarizer: Summarizer;
}
