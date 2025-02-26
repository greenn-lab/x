import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('TranscribeEngine')
export class TranscribeEngine {
  @PrimaryColumn({ type: 'varchar', length: 191 })
  id: string;

  @Column({ type: 'varchar', length: 191, default: 'HAIV' })
  provider: string;

  @Column({ type: 'varchar', length: 191, default: 'HAIV' })
  tag: string;

  @Column({ type: 'varchar', length: 191 })
  url: string;

  @Column({
    type: 'longtext',
    nullable: true,
    transformer: {
      to: (value: Record<string, unknown> | null) =>
        value ? JSON.stringify(value) : null,
      from: (value: string) =>
        value ? (JSON.parse(value) as Record<string, unknown>) : null,
    },
  })
  params: Record<string, unknown> | null;

  @Column({ type: 'int', default: 3 })
  maxQueue: number;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  isDefault: boolean;

  @Column({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createAt: Date;

  @Column({ type: 'datetime', precision: 3 })
  updateAt: Date;
}
