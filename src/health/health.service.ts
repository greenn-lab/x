import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import {
  DiskHealthIndicator,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';

import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';

import { ENVIRONMENT } from '@app/common/constants/environment.constant';
import { HttpStatusCode } from '@app/common/constants/response.constant';
import {
  HEALTH_MESSAGE,
  HEALTH_SERVICE,
} from '@app/health/constants/health.constant';
import { ReplicaSetStatus } from '@app/types/health/health.types';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private lastHealthyLog: string | null = null;
  private lastErrorState: Record<string, boolean> = {};

  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private mongo: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    @InjectConnection() private mongoConnection: Connection,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const isWindows = process.platform === 'win32';
    const diskPath = isWindows ? 'C:\\' : '/';

    try {
      const result = await this.health.check([
        () =>
          this.db.pingCheck(HEALTH_SERVICE.MARIADB, {
            timeout: 1000,
            connection: this.dataSource,
          }),
        () => this.checkMongoHealth(),
        () =>
          this.memory.checkHeap(
            HEALTH_SERVICE.MEMORY_HEAP,
            3 * 1024 * 1024 * 1024,
          ), // 3GB
        () =>
          this.disk.checkStorage(HEALTH_SERVICE.STORAGE, {
            thresholdPercent: 90,
            path: diskPath,
          }), // 90% 이상 사용 시 경고
      ]);

      this.addSystemInfo(result);
      this.logDailySummary(result);

      return result;
    } catch (error) {
      const errorResponse = (
        error as unknown as { response: HealthCheckResult }
      ).response;

      this.addSystemInfo(errorResponse);
      this.logStatusChanges(errorResponse);

      const errorDetails = this.getErrorDetails(errorResponse);

      throw new HttpException(
        {
          message: errorDetails.message,
          data: errorResponse,
        },
        errorDetails.statusCode,
      );
    }
  }

  private logDailySummary(result: HealthCheckResult): void {
    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (this.lastHealthyLog !== now) {
      this.lastHealthyLog = now;
      this.logger.log({
        message: 'Daily health check summary',
        status: result.status,
        components: Object.entries(result.info || {}).map(([name, data]) => ({
          name,
          status: data.status,
        })),
        timestamp: new Date().toISOString(),
      });
    }
  }

  private logStatusChanges(result: HealthCheckResult): void {
    const timestamp = new Date().toISOString();

    Object.entries(result.info || {}).forEach(([service, info]) => {
      const isError = info.status !== 'up';
      const wasError = this.lastErrorState[service] || false;

      // 상태가 변경된 경우에만 로깅
      if (isError !== wasError) {
        if (isError) {
          this.logger.error({
            message: 'Service error detected',
            service,
            status: info.status,
            timestamp,
          });
        } else {
          this.logger.log({
            message: 'Service recovered',
            service,
            timestamp,
          });
        }
      }

      this.lastErrorState[service] = isError;
    });
  }

  private addSystemInfo(result: HealthCheckResult): void {
    if (process.env.NODE_ENV === ENVIRONMENT.PRODUCTION) {
      return;
    }

    if (!result.info) {
      result.info = {};
    }

    result.info.system = {
      status: 'up',
      platform: process.platform,
      nodeVersion: process.version,
      uptime: this.formatUptime(process.uptime()),
      memoryUsage: process.memoryUsage(),
    };
  }

  private formatUptime(uptime: number): string {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  private async checkMongoHealth(
    isReplicaSet: boolean = false,
  ): Promise<HealthIndicatorResult> {
    try {
      const result = await this.mongo.pingCheck(HEALTH_SERVICE.MONGODB, {
        timeout: 1000,
      });

      // clusterMonitor 권한 필요
      if (isReplicaSet) {
        const replicaSetStatus = await this.checkMongoReplicaSetStatus();
        if (replicaSetStatus) {
          return { ...result, ...replicaSetStatus };
        }
      }

      return result;
    } catch (error) {
      this.logger.error('MongoDB health check failed:', error);
      throw error;
    }
  }

  private async checkMongoReplicaSetStatus(): Promise<HealthIndicatorResult | null> {
    try {
      if (!this.mongoConnection?.db) {
        throw new Error('MongoDB connection is not initialized');
      }

      const admin = this.mongoConnection.db.admin();
      const status = await admin.command({ replSetGetStatus: 1 });

      const replicaSetStatus = status as unknown as ReplicaSetStatus;

      const unhealthyMembers = replicaSetStatus.members.filter(
        (member) => member.health !== 1 || member.state !== 1,
      );

      if (unhealthyMembers.length > 0) {
        return {
          [HEALTH_SERVICE.MONGODB_REPLICA_SET]: {
            status: 'down',
            message: `Unhealthy replica members found: ${unhealthyMembers
              .map((m) => m.name)
              .join(', ')}`,
            members: unhealthyMembers,
          },
        };
      }

      return {
        [HEALTH_SERVICE.MONGODB_REPLICA_SET]: {
          status: 'down',
          message: 'All replica set members are healthy',
          members: replicaSetStatus.members,
        },
      };
    } catch (error) {
      this.logger.warn(
        'Failed to check MongoDB replica set status. This may be due to missing permissions:',
        error,
      );
      return null;
    }
  }

  private getErrorDetails(errorResponse: HealthCheckResult): {
    message: string;
    statusCode: HttpStatus;
  } {
    const statusCode = HttpStatusCode.NO;
    let message = HEALTH_MESSAGE.CHECK_FAILED;

    const errorServices = Object.entries(errorResponse.error || {})
      .filter(([, info]) => info.status === 'down')
      .map(([service]) => service);

    if (errorServices.length === 0) {
      return { message, statusCode };
    }

    if (errorServices.includes(HEALTH_SERVICE.MARIADB)) {
      message = HEALTH_MESSAGE.DATABASE_ERROR;
    } else if (errorServices.includes(HEALTH_SERVICE.MONGODB)) {
      message = HEALTH_MESSAGE.MONGODB_ERROR;
    } else if (errorServices.includes(HEALTH_SERVICE.MONGODB_REPLICA_SET)) {
      message = HEALTH_MESSAGE.MONGODB_ERROR;
    } else if (errorServices.includes(HEALTH_SERVICE.MEMORY_HEAP)) {
      message = HEALTH_MESSAGE.MEMORY_ERROR;
    } else if (errorServices.includes(HEALTH_SERVICE.STORAGE)) {
      message = HEALTH_MESSAGE.DISK_ERROR;
    }

    return { message, statusCode };
  }
}
