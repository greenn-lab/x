import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  // UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { Roles } from '@app/common/decorators/roles.decorator';
import { User } from '@app/common/decorators/user.decorator';
import { Workspace } from '@app/common/decorators/workspace.decorator';
import { ResponseDto } from '@app/common/dto/response.dto';
// import { TransformIdInterceptor } from '@app/common/interceptor/transformId.interceptor';
import {
  CreateTemplateDto,
  CreateTemplateDtoPlus,
} from '@app/template/dto/create-template.dto';
import { GetTemplatesDto } from '@app/template/dto/get-templates.dto';
import {
  OptionsDto,
  UpdateTemplateDto,
  UpdateTemplateDtoPlus,
} from '@app/template/dto/update-template.dto';
import { TemplateService } from '@app/template/template.service';
import { MemberRole, YesNo } from '@app/types/common/base.type';
import { TemplateWithUsernames } from '@app/types/template/template.type';

@ApiTags('Template')
@Controller('template')
// @UseInterceptors(TransformIdInterceptor)
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  // 템플릿 목록 조회
  @Get()
  @Roles(MemberRole.MEMBER)
  @ApiOperation({ summary: 'Get all templates' })
  async getTemplates(
    @Workspace() workspace: { id: string },
    @Query() options: GetTemplatesDto,
  ): Promise<
    ResponseDto<{ _count: number; templates: TemplateWithUsernames[] }>
  > {
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

  // 템플릿 상세 조회
  @Get(':templateId')
  @Roles(MemberRole.MEMBER)
  @ApiOperation({ summary: 'Get template detail' })
  async getTemplateDetail(
    @Workspace() workspace: { id: string },
    @Param('templateId') templateId: string,
    @Query('isModules') isModules: YesNo,
  ) {
    const result = await this.templateService.getTemplateDetail(
      workspace.id,
      templateId,
      isModules,
    );
    return ResponseDto.success(result);
  }

  @Put(':templateId')
  @Roles(MemberRole.OWNER)
  @ApiOperation({ summary: 'Update template' })
  async updateTemplate(
    @Workspace() workspace: { id: string },
    @Param('templateId') templateId: string,
    @User() user: { pid: string },
    @Body() body: UpdateTemplateDto,
  ) {
    const dto: UpdateTemplateDtoPlus = {
      ...body,
      workspaceId: workspace.id,
      editorPID: user.pid,
    };
    const result = await this.templateService.updateTemplate(templateId, dto);

    return ResponseDto.success(result);
  }

  // 템플릿 사용 상태
  @Patch(':templateId/status')
  @Roles(MemberRole.OWNER)
  @ApiOperation({ summary: 'Update template status' })
  async updateTemplateStatus(
    @Workspace() workspace: { id: string },
    @Param('templateId') templateId: string,
    @Query() options: OptionsDto,
  ) {
    const result = await this.templateService.updateTemplateStatus(
      workspace.id,
      templateId,
      options,
    );
    return ResponseDto.success(result);
  }
}
