import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  // UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

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
import { StatusDto } from '@app/template/dto/update-template-status.dto';
import {
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
  @ApiResponse({ status: 200 })
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
  @ApiBody({ type: CreateTemplateDto })
  @ApiResponse({ status: 201 })
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
    return ResponseDto.create(result);
  }

  // 사용가능한 템플릿 모듈 조회
  @Get('module')
  @Roles(MemberRole.OWNER)
  @ApiOperation({ summary: 'Get module set for making template' })
  @ApiResponse({ status: 200 })
  async getTemplateModules(@Workspace() workspace: { id: string }) {
    const result = await this.templateService.getTemplateModules(workspace.id);
    return ResponseDto.success(result);
  }

  // 템플릿 상세 조회
  @ApiQuery({
    name: 'isModules',
    required: false,
    type: String,
    enum: YesNo,
    default: YesNo.N,
    description: '(수정 페이지) 모듈 동시 조회 여부',
  })
  @ApiParam({
    name: 'templateId',
    required: true,
    type: String,
    description: '템플릿 ID',
  })
  @Get(':templateId')
  @Roles(MemberRole.MEMBER)
  @ApiOperation({ summary: 'Get template detail' })
  @ApiQuery({
    name: 'isModules',
    required: false,
    type: String,
    enum: YesNo,
    default: YesNo.N,
    description: '(수정 페이지) 모듈 동시 조회 여부',
  })
  @ApiResponse({ status: 200 })
  async getTemplateDetail(
    @Workspace() workspace: { id: string },
    @Param('templateId') templateId: string,
    @Query('isModules') isModules?: YesNo,
  ) {
    const result = await this.templateService.getTemplateDetail(
      workspace.id,
      templateId,
      isModules,
    );
    return ResponseDto.success(result);
  }

  // 템플릿 수정
  @Put(':templateId')
  @Roles(MemberRole.OWNER)
  @ApiOperation({ summary: 'Update template' })
  @ApiBody({ type: UpdateTemplateDto })
  @ApiResponse({ status: 200 })
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
  @ApiResponse({ status: 200 })
  async updateTemplateStatus(
    @Workspace() workspace: { id: string },
    @Param('templateId') templateId: string,
    @Query() statusDto: StatusDto,
  ) {
    const result = await this.templateService.updateTemplateStatus(
      workspace.id,
      templateId,
      statusDto,
    );
    return ResponseDto.success(result);
  }

  // 템플릿 삭제
  @Delete(':templateId')
  @Roles(MemberRole.OWNER)
  @ApiOperation({ summary: 'Delete template' })
  @ApiResponse({ status: 200 })
  async deleteTemplate(
    @Workspace() workspace: { id: string },
    @Param('templateId') templateId: string,
  ) {
    const result = await this.templateService.deleteTemplate(
      workspace.id,
      templateId,
    );
    return ResponseDto.success(result);
  }
}
