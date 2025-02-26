import {
  Column,
  Entity,
  JoinColumn,
  Index,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import { User } from '@app/user/entities/user.entity';

@Entity('UserProfile')
export class UserProfile {
  @PrimaryColumn()
  @Index('idx_pid')
  pid: string;

  @Column({ length: 128, nullable: true })
  name: string;

  @Column({ length: 128, unique: true })
  nickName: string;

  @Column({ length: 256, nullable: true, unique: true })
  email: string;

  @Column({ length: 512, default: '' })
  thumbnailUrl: string;

  @Column({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createAt: Date;

  @Column({ type: 'datetime', precision: 3 })
  updateAt: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'pid' })
  user: User;
}
