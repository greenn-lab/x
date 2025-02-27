import { ViewEntity, ViewColumn, PrimaryColumn } from 'typeorm';

@ViewEntity('MonthlyWorkspaceStats')
export class MonthlyWorkspaceStats {
  @ViewColumn()
  @PrimaryColumn()
  workspaceId: string;

  @ViewColumn()
  domain: string;

  @ViewColumn()
  @PrimaryColumn()
  month: string;

  @ViewColumn()
  totalDuration: number;

  @ViewColumn()
  totalCount: number;

  @ViewColumn()
  doneTotalDuration: number;

  @ViewColumn()
  doneCount: number;

  @ViewColumn()
  errorTotalDuration: number;

  @ViewColumn()
  errorCount: number;

  @ViewColumn()
  llmTotalToken: number;

  @ViewColumn()
  llmTotalCount: number;

  @ViewColumn()
  llmDoneCount: number;

  @ViewColumn()
  llmErrorCount: number;
}
