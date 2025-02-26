import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DailyMemberStats } from '@app/stat/entities/daily-member-stats.entity';
import { HourlyMemberStats } from '@app/stat/entities/hourly-member-stats.entity';
import { MonthlyMemberStats } from '@app/stat/entities/monthly-member-stats.entity';
import { MonthlyWorkspaceStats } from '@app/stat/entities/monthly-workspace-stats.entity';
import { WeeklyMemberStats } from '@app/stat/entities/weekly-member-stats.entity';
import { MemberStatsRepository } from '@app/stat/repositories/member-stats.repository';
import { MonthlyWorkspaceStatsRepository } from '@app/stat/repositories/monthly-workspace-stats.repository';
import { StatController } from '@app/stat/stat.controller';
import { StatService } from '@app/stat/stat.service';
import { StatsMemberUtil } from '@app/stat/utils/stats-member.util';
import { WorkspaceConfig } from '@app/workspace/entities/workspace-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MonthlyWorkspaceStats,
      DailyMemberStats,
      WeeklyMemberStats,
      MonthlyMemberStats,
      HourlyMemberStats,
      WorkspaceConfig,
    ]),
  ],
  controllers: [StatController],
  providers: [
    StatService,
    MonthlyWorkspaceStatsRepository,
    MemberStatsRepository,
    StatsMemberUtil,
  ],
})
export class StatModule {}
