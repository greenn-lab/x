import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import { TranscribeEngine } from '@app/transcribe/entities/transcribe-engine.entity';
import { Workspace } from '@app/workspace/entities/workspace.entity';

@Entity('WorkspaceConfig')
export class WorkspaceConfig {
  @PrimaryColumn({ type: 'varchar', length: 191 })
  workspaceId: string;

  @OneToOne(() => Workspace, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column({ type: 'int', default: 120 })
  memberMaxCount: number;

  @Column({ type: 'int', default: 4 })
  ownerMaxCount: number;

  @Column({ type: 'int', default: 40 })
  guestMaxCount: number;

  @Column({ type: 'varchar', length: 128, default: '' })
  inviteCode: string;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  disableAt: Date | null;

  @Column({ type: 'varchar', length: 191, nullable: true })
  transcribeEngineId: string | null;

  @ManyToOne(() => TranscribeEngine, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'transcribeEngineId' })
  transcribeEngine: TranscribeEngine;
}
