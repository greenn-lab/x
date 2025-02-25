import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { LlmVendor } from '@app/llm/entities/llm-vendor.entity';
import { Llm } from '@app/llm/entities/llm.entity';
import { Member } from '@app/member/entities/member.entity';
import { UserProfile } from '@app/user/entities/user-profile.entity';
import { User } from '@app/user/entities/user.entity';
import { MonthlyWorkspaceStats } from '@app/workspace/entities/monthly-workspace-stats.entity';
import { Workspace } from '@app/workspace/entities/workspace.entity';

export const getRdbConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: configService.get<string>('DB_TYPE') as 'mariadb' | 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: [
    Llm,
    LlmVendor,
    Member,
    Workspace,
    User,
    MonthlyWorkspaceStats,
    UserProfile,
  ],
  synchronize: false,
});
