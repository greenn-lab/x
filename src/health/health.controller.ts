import { Controller, Get } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';

import { Public } from '@app/common/decorators/public.decorator';
import { ResponseDto } from '@app/common/dto/response.dto';
import { HealthService } from '@app/health/health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @HealthCheck()
  async check() {
    const result = await this.healthService.check();
    return ResponseDto.success(result);
  }
}
