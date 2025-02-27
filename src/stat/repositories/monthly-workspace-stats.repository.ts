import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FindAllWorkspaceStatDto } from '@app/stat/dto/find-all-workspace-stat.dto';
import { MonthlyWorkspaceStats } from '@app/stat/entities/monthly-workspace-stats.entity';

@Injectable()
export class MonthlyWorkspaceStatsRepository extends Repository<MonthlyWorkspaceStats> {
  constructor(
    @InjectRepository(MonthlyWorkspaceStats)
    private readonly repository: Repository<MonthlyWorkspaceStats>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findAllWorkspaceStats(
    query: FindAllWorkspaceStatDto & { year: string; domain: string },
  ) {
    const { year, domain } = query;

    const queryBuilder = this.createQueryBuilder('stats').where(
      'stats.month LIKE :year',
      { year: `${year}-%` },
    );

    if (domain) {
      queryBuilder.andWhere('stats.domain = :domain', { domain });
    }

    const results = await queryBuilder.orderBy('stats.month', 'DESC').getMany();

    return results.map((stat) => ({
      month: stat.month,
      totalDuration: Number(stat.totalDuration),
      totalCount: Number(stat.totalCount),
      doneTotalDuration: Number(stat.doneTotalDuration),
      doneCount: Number(stat.doneCount),
      errorTotalDuration: Number(stat.errorTotalDuration),
      errorCount: Number(stat.errorCount),
      llmTotalToken: Number(stat.llmTotalToken),
      llmTotalCount: Number(stat.llmTotalCount),
      llmDoneCount: Number(stat.llmDoneCount),
      llmErrorCount: Number(stat.llmErrorCount),
    }));
  }
}
