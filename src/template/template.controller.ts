import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { Roles } from '@app/common/decorators/roles.decorator';
import { Workspace } from '@app/common/decorators/workspace.decorator';
import { ResponseDto } from '@app/common/dto/response.dto';
import { GetTemplatesDto } from '@app/template/dto/get-templates.dto';
import { TemplateService } from '@app/template/template.service';
import { MemberRole } from '@app/types/common/base.type';

@ApiTags('Template')
@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

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

  @Get('module')
  @Roles(MemberRole.OWNER)
  @ApiOperation({ summary: 'Get module set for making template' })
  async getTemplateModules(@Workspace() workspace: { id: string }) {
    const result = await this.templateService.getTemplateModules(workspace.id);
    return ResponseDto.success(result);
  }
}
