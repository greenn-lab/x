import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';

import { User } from '@app/user/entities/user.entity';
import { WorkspaceConfig } from '@app/workspace/entities/workspace-config.entity';

@Entity('Workspace')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  @Index('idx_workspaceId')
  id: string;

  @Column({ length: 128, unique: true })
  @Index('idx_name')
  name: string;

  @Column({ length: 512, default: '' })
  thumbnailUrl: string;

  @Column({ length: 256, unique: true })
  @Index('idx_domain')
  domain: string;

  @Column()
  ownerId: string;

  @ManyToOne(() => User, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createAt: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 3 })
  updateAt: Date;

  @Column({ length: 128, default: '' })
  inviteCode: string;

  @Column({ length: 2048, default: '' })
  description: string;

  @OneToOne(() => WorkspaceConfig, (config) => config.workspace, {
    cascade: true,
  })
  config: WorkspaceConfig;
}
