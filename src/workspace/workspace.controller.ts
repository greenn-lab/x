import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '@app/common/decorators/roles.decorator';
import { Token } from '@app/common/decorators/token.decorator';
import { User } from '@app/common/decorators/user.decorator';
import { Workspace } from '@app/common/decorators/workspace.decorator';
import { ResponseDto } from '@app/common/dto/response.dto';
import { MemberRole } from '@app/types/common/base.type';
import { CreateWorkspaceDto } from '@app/workspace/dto/create-workspace.dto';
import { FindWorkspaceDto } from '@app/workspace/dto/find-workspace.dto';
import { UpdateMaxCountDto } from '@app/workspace/dto/update-max-count.dto';
import {
  WorkspaceValidationDto,
  WorkspaceValidationNameDto,
} from '@app/workspace/dto/workspace-validation.dto';
import { WorkspaceService } from '@app/workspace/workspace.service';

@ApiTags('WORKSPACE')
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get(':workspaceId')
  @ApiOperation({ summary: '특정 워크스페이스 조회' })
  @Roles(MemberRole.GUEST)
  async getWorkspace(@Param('workspaceId') id: string) {
    return ResponseDto.success(await this.workspaceService.getWorkspace(id));
  }

  @Get()
  @ApiOperation({ summary: '워크스페이스 목록 조회' })
  @Roles(MemberRole.ADMIN)
  async getWorkspaces(
    @Workspace() workspace: { id: string },
    @Query() query: FindWorkspaceDto,
  ) {
    return ResponseDto.success(
      await this.workspaceService.getWorkspaces(workspace.id, query),
    );
  }

  @Post()
  @ApiOperation({ summary: '워크스페이스 생성' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '워크스페이스 생성',
    type: CreateWorkspaceDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  @Roles(MemberRole.ADMIN)
  async create(
    @User() user: { pid: string },
    @Token() token: string,
    @Body() body: CreateWorkspaceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return ResponseDto.success(
      await this.workspaceService.create(user.pid, body, file, token),
    );
  }

  @Delete(':workspaceId')
  @ApiOperation({ summary: '워크스페이스 삭제' })
  @Roles(MemberRole.OWNER)
  async delete(@Param('workspaceId') workspaceId: string) {
    return ResponseDto.success(await this.workspaceService.delete(workspaceId));
  }

  @Put(':workspaceId/status')
  @ApiOperation({ summary: '워크스페이스 상태 업데이트' })
  @Roles(MemberRole.ADMIN)
  async updateStatus(@Param('workspaceId') workspaceId: string) {
    return ResponseDto.success(
      await this.workspaceService.updateStatus(workspaceId),
    );
  }

  @Put(':workspaceId/member')
  @ApiOperation({ summary: '최대 멤버 수 업데이트' })
  @Roles(MemberRole.ADMIN)
  async updateMaxMembers(
    @Param('workspaceId') id: string,
    @Body() body: UpdateMaxCountDto,
  ) {
    return ResponseDto.success(
      await this.workspaceService.updateMaxMembers(id, body),
    );
  }

  @Put(':workspaceId/name')
  @ApiOperation({ summary: '워크스페이스 이름 업데이트' })
  @Roles(MemberRole.OWNER)
  async updateWorkspaceName(
    @Param('workspaceId') id: string,
    @Body() body: WorkspaceValidationNameDto,
  ) {
    return ResponseDto.success(
      await this.workspaceService.updateWorkspaceName(id, body),
    );
  }

  @Post('validation')
  @ApiOperation({ summary: '워크스페이스 유효성 검사' })
  @Roles(MemberRole.ADMIN)
  async validation(@Body() body: WorkspaceValidationDto) {
    return ResponseDto.success(
      await this.workspaceService.validation(body.domain, body.name),
    );
  }

  @Post('validation/name')
  @ApiOperation({ summary: '워크스페이스 이름 유효성 검사' })
  @Roles(MemberRole.OWNER)
  async validationName(@Body() body: WorkspaceValidationNameDto) {
    return ResponseDto.success(
      await this.workspaceService.validation('', body.name),
    );
  }

  @Put(':workspaceId/thumbnail')
  @ApiOperation({ summary: '워크스페이스 썸네일 업데이트' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Roles(MemberRole.OWNER)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '썸네일 이미지 파일',
        },
      },
    },
  })
  async updateThumbnail(
    @Param('workspaceId') workspaceId: string,
    @Token() token: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return ResponseDto.success(
      await this.workspaceService.updateThumbnail(workspaceId, file, token),
    );
  }
}
