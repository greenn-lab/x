import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('UserProfile')
export class UserProfile {
  @PrimaryColumn()
  @Index('idx_pid')
  pid: string;

  @Column()
  @Index('idx_domain')
  domain: string;

  @Column()
  name: string;

  @Column()
  nickName: string;

  @Column()
  email: string;

  @Column()
  thumbnailUrl: string;

  @Column({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createAt: Date;

  @Column({ type: 'datetime', precision: 3 })
  updateAt: Date;
}
