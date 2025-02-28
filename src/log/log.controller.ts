import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ResponseDto } from '@app/common/dto/response.dto';
import { CreateLogDto } from '@app/log/dto/create-log';
import { LogService } from '@app/log/log.service';

@ApiTags('Log')
@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Post('error')
  @ApiOperation({ summary: '클라이언트 에러 로그 생성' })
  async createClientErrorLog(@Body() logData: CreateLogDto) {
    const result = await this.logService.createClientErrorLog(logData);
    return new ResponseDto('Success', 201, result);
  }
}
