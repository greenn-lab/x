import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';

import { Workspace } from '@app/workspace/entities/workspace.entity';

@Entity('WorkspaceConfig')
export class WorkspaceConfig {
  @PrimaryColumn('varchar')
  workspaceId: string;

  @OneToOne(() => Workspace, (workspace) => workspace.config, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column('int', { default: 120 })
  memberMaxCount: number;

  @Column('int', { default: 4 })
  ownerMaxCount: number;

  @Column('int', { default: 40 })
  guestMaxCount: number;

  @Column('varchar', { nullable: true })
  transcribeEngineId: string | null;

  @Column('varchar', { length: 128, default: '' })
  inviteCode: string;

  @Column('datetime', { nullable: true })
  disableAt: Date | null;
}
