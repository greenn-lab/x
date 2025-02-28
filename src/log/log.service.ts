import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { Log } from '@app/log/schemas/log.schema';

@Injectable()
export class LogService {
  private readonly logger = new Logger(LogService.name);

  constructor(
    @InjectModel(Log.name)
    private logRepository: Model<Log>,
  ) {}

  /**
   * 클라이언트 에러 로그 생성
   */
  async createClientErrorLog(errorLogs: {
    email: string;
    group: string;
    transaction: any[];
  }): Promise<Log> {
    try {
      this.logger.log('클라이언트 로그 생성 시작');
      const newLog = new this.logRepository(errorLogs);
      const result = await newLog.save();
      if (!result) {
        throw new Error('클라이언트 로그 생성 실패');
      }

      this.logger.log('클라이언트 로그 생성 완료');

      return result;
    } catch (error) {
      this.logger.error('클라이언트 로그 생성 실패', error);
      throw new Error('클라이언트 로그 생성 실패');
    }
  }
}
