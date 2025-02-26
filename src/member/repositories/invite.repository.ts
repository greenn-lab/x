import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { Invite } from '@app/member/entities/invite.entity';

@Injectable()
export class InviteRepository extends Repository<Invite> {
  constructor(dataSource: DataSource) {
    super(Invite, dataSource.createEntityManager());
  }

  async createInvite(invite: Partial<Invite>): Promise<Invite> {
    const newInvite = this.create(invite);
    return await this.save(newInvite);
  }

  async findByEmail(email: string) {
    return this.findBy({
      email,
    });
  }
}
