import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import {
  Locale,
  Summarizer,
  TranscribeEngine,
} from '@app/types/user/user.type';
import { User } from '@app/user/entities/user.entity';

@Entity('UserConfig')
export class UserConfig {
  @PrimaryColumn()
  pid: string;

  @Column({ length: 256, nullable: true })
  statusMessage: string;

  @Column({
    type: 'enum',
    enum: Locale,
    default: Locale.KO,
  })
  locale: Locale;

  @Column({
    type: 'enum',
    enum: Locale,
    default: Locale.NONE,
  })
  transcribeLang: Locale;

  @Column({
    type: 'enum',
    enum: TranscribeEngine,
    default: TranscribeEngine.CLOVA,
  })
  transcribeEngine: TranscribeEngine;

  @Column({
    type: 'enum',
    enum: Summarizer,
    default: Summarizer.OPENAI,
  })
  summarizer: Summarizer;

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
