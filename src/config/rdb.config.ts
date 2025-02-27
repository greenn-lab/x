import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Invite } from '@app/member/entities/invite.entity';
import { Member } from '@app/member/entities/member.entity';
import { TranscribeEngine } from '@app/transcribe/entities/transcribe-engine.entity';
import { UserConfig } from '@app/user/entities/user-config.entity';
import { UserProfile } from '@app/user/entities/user-profile.entity';
import { UserView } from '@app/user/entities/user-view.entity';
import { User } from '@app/user/entities/user.entity';
import { WorkspaceConfig } from '@app/workspace/entities/workspace-config.entity';
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
  autoLoadEntities: true,
  entities: [
    Member,
    Workspace,
    WorkspaceConfig,
    TranscribeEngine,
    User,
    UserView,
    UserProfile,
    UserConfig,
    Invite,
  ],
  synchronize: false,
});
