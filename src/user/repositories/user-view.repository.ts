import { Injectable } from '@nestjs/common';

import { DataSource, In, Repository } from 'typeorm';

import { UserView } from '@app/user/entities/user-view.entity';

@Injectable()
export class UserViewRepository extends Repository<UserView> {
  constructor(private dataSource: DataSource) {
    super(UserView, dataSource.createEntityManager());
  }

  async getUserNickNames(pids: string[]): Promise<UserView[]> {
    console.log('getUserNickNames');
    const users = await this.find({
      where: {
        pid: In(pids), // $in 대신 In 사용
      },
      select: {
        nickName: true,
        pid: true,
      },
    });

    console.log('users', users);
    return users;
  }
}
