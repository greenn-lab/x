import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { Roles } from '@app/common/decorators/roles.decorator';
import { Workspace } from '@app/common/decorators/workspace.decorator';
import { ResponseDto } from '@app/common/dto/response.dto';
import { FindMemberDto } from '@app/member/dto/find-member.dto';
import { MemberService } from '@app/member/member.service';
import { MemberRole } from '@app/types/common/base.type';

@Controller('members')
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
  async findOne(@Param('id') id: string) {
    return ResponseDto.success(await this.memberService.findOne(id));
  }

  @Post('invite')
  create(@Body() _: any) {
    return 'No work ' + _;
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return 'No work ' + id;
  }
}
