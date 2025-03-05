import { ApiProperty } from '@nestjs/swagger';

import { Template } from '@app/template/schemas/template.schema';

export class ModuleItem {
  @ApiProperty({
    description: '아이템 인덱스',
    example: 0,
  })
  index: number;

  @ApiProperty({
    description: '아이템 타입 (basic, loop)',
    example: 'basic',
  })
  type: string;

  @ApiProperty({
    description: '아이템 값',
    example: '{{title}}',
  })
  value: string;
}

export class Module {
  @ApiProperty({
    description: '모듈 인덱스',
    example: 0,
  })
  index: number;

  @ApiProperty({
    description: '모듈 키',
    example: 'title',
  })
  moduleKey: string;

  @ApiProperty({
    description: '화면에 표시될 모듈 이름',
    required: false,
  })
  displayName?: string;

  @ApiProperty({
    description: '모듈에 포함된 아이템 목록',
    type: () => [ModuleItem],
    example: [
      {
        index: 0,
        type: 'basic',
        value: '{{title}}',
      },
    ],
  })
  items: ModuleItem[];
}

export interface TemplateFilter {
  workspaceId: string;
  isDeleted: string;
  title?: { $regex: string; $options: string };
}

// Template 타입에서 PID 관련 필드를 제외하고 username 필드를 추가한 타입
export interface TemplateWithUsernames
  extends Omit<Template, 'creatorPID' | 'editorPID'> {
  creator?: string;
  editor?: string;
}

export interface TemplateDetail extends Template {
  modules?: Module[];
}
