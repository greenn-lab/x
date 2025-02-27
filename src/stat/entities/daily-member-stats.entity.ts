import { ViewEntity, ViewColumn, PrimaryColumn } from 'typeorm';

@ViewEntity('DailyMemberStats')
export class DailyMemberStats {
  @ViewColumn()
  @PrimaryColumn()
  memberId: string;

  @ViewColumn()
  @PrimaryColumn()
  date: string;

  @ViewColumn()
  day: string;

  @ViewColumn()
  contentTotalDuration: number;

  @ViewColumn()
  contentCount: number;

  @ViewColumn()
  llmTotalToken: number;

  @ViewColumn()
  llmCount: number;
}
