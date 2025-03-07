import {
  DynamicModule,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import Consul from 'consul';

import { ENVIRONMENT } from '@app/common/constants/environment.constant';
import { getServerIp } from '@app/common/utils/ip.util';
import { SERVICE_PORT } from '@app/main';

export class ConsulModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConsulModule.name);
  private readonly service: Record<string, string> = {};

  private consul: Consul;

  constructor(private readonly config: ConfigService) {
    this.service.name = config.get('PROJECT_CODE', 'service');
    this.service.port = config.get('PORT', SERVICE_PORT + '');
    this.service.host = getServerIp();

    this.onModuleInit();
  }

  static forRoot(): DynamicModule {
    return {
      module: ConsulModule,
      providers: [
        {
          provide: ConsulModule,
          useFactory: (config: ConfigService) => {
            return new ConsulModule(config);
          },
          inject: [ConfigService],
        },
      ],
      exports: [ConsulModule],
    };
  }

  onModuleInit() {
    this.logger.log('Consul module initialized');

    this.initialize();
    this.watchKeyValueChanged();

    if (this.config.get('NODE_ENV') !== ENVIRONMENT.LOCAL)
      this.registryDiscovery();
  }

  onModuleDestroy() {
    this.logger.log('Consul Module destroyed');
    // await this.consul.agent.service.deregister({});
  }

  private registryDiscovery() {
    this.consul.agent.service
      .register({
        name: this.service.name,
        id: `${this.service.name}-${this.service.host}`,
        address: `${this.service.host}`,
        port: parseInt(this.service.port),
        check: {
          name: this.service.name,
          http: `http://${this.service.host}:${this.service.port}/health`,
          interval: '10s',
          timeout: '5s',
          deregistercriticalserviceafter: '30s',
        },
      })
      .then(() => {
        this.logger.log(`Consul service(${this.service.name}) initialized`);
      })
      .catch((error) => {
        this.logger.error('Consul service error', error);
      });
  }

  private watchKeyValueChanged() {
    this.consul
      .watch({
        method: (key: string) => this.consul.kv.get(key),
        options: {
          key: this.config.get('KEY_VALUE_STORE', ''),
        },
      })
      .on('change', ({ Value: value }: { Value: string }) => {
        const values = JSON.parse(value) as Record<string, any>;
        Object.keys(values).forEach((key: string) => {
          this.config.set(key, values[key]);
          this.logger.debug(`synchronized value: ${key}=${values[key]}`);
        });
      });
  }

  private initialize() {
    this.consul = new Consul({
      host: this.config.get('DISCOVERY_HOST', 'consul-discovery'),
      port: this.config.get('DISCOVERY_PORT', 8500),
      secure: false,
    });

    return this.consul;
  }
}
