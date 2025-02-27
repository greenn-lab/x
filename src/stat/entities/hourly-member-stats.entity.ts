import { ViewEntity, ViewColumn, PrimaryColumn } from 'typeorm';

@ViewEntity('HourlyMemberStats')
export class HourlyMemberStats {
  @ViewColumn()
  @PrimaryColumn()
  memberId: string;

  @ViewColumn()
  contentTotalDuration: number;

  @ViewColumn()
  contentCount: number;

  @ViewColumn()
  llmTotalToken: number;

  @ViewColumn()
  llmCount: number;

  @ViewColumn()
  @PrimaryColumn()
  date: string;

  @ViewColumn()
  @PrimaryColumn()
  hour: number;
}
