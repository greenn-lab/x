import { Injectable } from '@nestjs/common';

import { StatType } from '@app/types/stat/stat.type';

@Injectable()
export class StatsMemberUtil {
  getQueryOptions(type: StatType, date: string) {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const baseDate = `${year}-${month}-${day}`;
    const baseMonth = `${year}-${month}`;
    const hour = dateObj.getHours();

    // 주차 계산
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear =
      (dateObj.getTime() - firstDayOfYear.getTime()) / 86400000;
    const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

    const queryOptions = {
      [StatType.HOURLY]: {
        where: { date: baseDate, hour },
        orderBy: { hour: 'ASC' },
      },
      [StatType.DAILY]: {
        where: { date: baseDate },
        orderBy: { date: 'ASC' },
      },
      [StatType.WEEKLY]: {
        where: {
          week,
          month: baseMonth,
        },
        orderBy: { week: 'ASC' },
      },
      [StatType.MONTHLY]: {
        where: { month: baseMonth },
        orderBy: { month: 'ASC' },
      },
    };

    return queryOptions[type];
  }

  getEntityByType(type: StatType) {
    const entityMap = {
      [StatType.HOURLY]: 'HourlyMemberStats',
      [StatType.DAILY]: 'DailyMemberStats',
      [StatType.WEEKLY]: 'WeeklyMemberStats',
      [StatType.MONTHLY]: 'MonthlyMemberStats',
    };

    return entityMap[type];
  }
}
