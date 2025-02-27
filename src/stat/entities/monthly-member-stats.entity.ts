import { ViewEntity, ViewColumn, PrimaryColumn } from 'typeorm';

@ViewEntity('MonthlyMemberStats')
export class MonthlyMemberStats {
  @ViewColumn()
  @PrimaryColumn()
  memberId: string;

  @ViewColumn()
  @PrimaryColumn()
  month: string;

  @ViewColumn()
  contentTotalDuration: number;

  @ViewColumn()
  contentCount: number;

  @ViewColumn()
  llmTotalToken: number;

  @ViewColumn()
  llmCount: number;
}
