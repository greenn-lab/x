import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MemberRole } from '@app/types/common/base.type';

@Entity('Invite')
export class Invite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index('idx_workspaceId')
  workspaceId: string;

  @Column()
  @Index('idx_email')
  email: string;

  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.MEMBER,
  })
  role: MemberRole;

  @Column({ type: 'datetime', precision: 3 })
  expireAt: Date;

  @CreateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createAt: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 3 })
  updateAt: Date;
}
