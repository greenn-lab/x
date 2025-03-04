import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import { Roles } from '@app/common/decorators/roles.decorator';
import { Workspace } from '@app/common/decorators/workspace.decorator';
import { ResponseDto } from '@app/common/dto/response.dto';
import { FindMemberDto } from '@app/member/dto/find-member.dto';
import { InviteMemberDto } from '@app/member/dto/invite-member.dto';
import { UpdateMemberDto } from '@app/member/dto/update-member.dto';
import { MemberService } from '@app/member/member.service';
import { MemberRole } from '@app/types/common/base.type';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  @Roles(MemberRole.OWNER)
  @ApiOperation({ summary: '모든 회원 불러오기' })
  async findAll(
    @Workspace() workspace: { id: string },
    @Query() query: FindMemberDto,
  ) {
    return ResponseDto.success(
      await this.memberService.findAll(workspace.id, query),
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: '회원 ID',
    example: '00000000-0000-0000-0000-000000000000',
  })
  async findOne(@Param('id') id: string) {
    return ResponseDto.success(await this.memberService.findOne(id));
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    description: '회원 ID',
    example: '00000000-0000-0000-0000-000000000000',
    required: true,
  })
  async update(@Param('id') id: string, @Body() member: UpdateMemberDto) {
    return ResponseDto.success(await this.memberService.update(id, member));
  }

  @Post('invite')
  @Roles(MemberRole.OWNER)
  async invite(
    @Workspace() workspace: { id: string },
    @Body() invitation: InviteMemberDto,
  ) {
    return ResponseDto.success(
      await this.memberService.invite(workspace.id, invitation),
    );
  }
}
