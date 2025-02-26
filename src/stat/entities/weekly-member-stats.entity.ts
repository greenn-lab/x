import { ViewEntity, ViewColumn, PrimaryColumn } from 'typeorm';

@ViewEntity('WeeklyMemberStats')
export class WeeklyMemberStats {
  @ViewColumn()
  @PrimaryColumn()
  memberId: string;

  @ViewColumn()
  @PrimaryColumn()
  month: string;

  @ViewColumn()
  @PrimaryColumn()
  week: number;

  @ViewColumn()
  contentTotalDuration: number;

  @ViewColumn()
  contentCount: number;

  @ViewColumn()
  llmTotalToken: number;

  @ViewColumn()
  llmCount: number;
}
