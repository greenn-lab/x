import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { Roles } from '@app/common/decorators/roles.decorator';
import { User } from '@app/common/decorators/user.decorator';
import { Workspace } from '@app/common/decorators/workspace.decorator';
import { ResponseDto } from '@app/common/dto/response.dto';
import {
  CreateTemplateDto,
  CreateTemplateDtoPlus,
} from '@app/template/dto/create-template.dto';
import { GetTemplatesDto } from '@app/template/dto/get-templates.dto';
import { TemplateService } from '@app/template/template.service';
import { MemberRole } from '@app/types/common/base.type';

@ApiTags('Template')
@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  // 템플릿 목록 조회
  @Get()
  @Roles(MemberRole.MEMBER)
  @ApiOperation({ summary: 'Get all templates' })
  async getTemplates(
    @Workspace() workspace: { id: string },
    @Query() options: GetTemplatesDto,
  ) {
    const result = await this.templateService.getTemplates(
      workspace.id,
      options,
    );
    return ResponseDto.success(result);
  }

  //템플릿 생성
  @Post()
  @Roles(MemberRole.OWNER)
  @ApiOperation({ summary: 'Create template' })
  async createTemplate(
    @Workspace() workspace: { id: string },
    @User() user: { pid: string },
    @Body() body: CreateTemplateDto,
  ) {
    const data: CreateTemplateDtoPlus = {
      ...body,
      workspaceId: workspace.id,
      creatorPID: user.pid,
      editorPID: user.pid,
    };
    const result = await this.templateService.createTemplate(data);
    return ResponseDto.success(result);
  }

  // 사용가능한 템플릿 모듈 조회
  @Get('module')
  @Roles(MemberRole.OWNER)
  @ApiOperation({ summary: 'Get module set for making template' })
  async getTemplateModules(@Workspace() workspace: { id: string }) {
    const result = await this.templateService.getTemplateModules(workspace.id);
    return ResponseDto.success(result);
  }
}
