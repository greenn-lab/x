import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { TemplateService } from '@app/template/template.service';
import { Module, ModuleItem } from '@app/types/template/template.type';

@Injectable()
export class TemplateProcessorUtil {
  constructor(
    @Inject(forwardRef(() => TemplateService))
    private templateService: TemplateService,
  ) {}

  async checkTemplate(workspaceId: string, modules: Module[]) {
    if (!Array.isArray(modules)) {
      return false;
    }

    // 사용 가능한 모듈 키 검사
    const moduleSet =
      await this.templateService.getTemplateModules(workspaceId);
    const usableModuleKeys = moduleSet.modules.map(
      (module) => module.moduleKey,
    );

    const invalidModuleKeys = modules
      .filter((module: Module) => !usableModuleKeys.includes(module.moduleKey))
      .map((module: Module) => module.moduleKey);

    if (invalidModuleKeys.length > 0) {
      // throw new Error(1047, { invalidModuleKeys, usableModuleKeys });
    }

    return modules.every((module) => {
      // 필수 필드 존재 확인
      if (
        module.index === null ||
        module.moduleKey === null ||
        module.items === null
      ) {
        // throw new Error(1047, { module });
      }

      // 타입 검사
      if (typeof module !== 'object') throw new Error();
      if (typeof module.index !== 'number') throw new Error();
      if (typeof module.moduleKey !== 'string') throw new Error();
      if (!Array.isArray(module.items)) throw new Error();

      return module.items.every((item: ModuleItem) => {
        // 필수 필드 확인
        if (!item.type || (!item.value && item.value !== '')) {
          throw new Error();
        }
        // 타입 검사
        if (
          typeof item.index !== 'number' ||
          typeof item.type !== 'string' ||
          typeof item.value !== 'string'
        ) {
          throw new Error();
        }
        // type 값 검증
        if (item.type !== 'basic' && item.type !== 'loop') {
          throw new Error();
        }

        return true;
      });
    });
  }

  processTemplateToText(modules: Module[]): string {
    return modules
      .map((module) => {
        const basicItem = module.items[0];
        if (module.items.length === 1 && basicItem.type === 'basic') {
          return basicItem.value; // 기본 타입 문자열 반환
        }
        return module.items.find((item) => item.type === 'loop')?.value || ''; // 문자열 반환
      }) // ["텍스트1", "", "텍스트2", "", "텍스트3"]
      .filter(Boolean) // 빈 문자열 및 null 제거 -> ["텍스트1", "텍스트2", "텍스트3"]
      .join('\n\n');
  }

  processTemplate(modules: Module[]) {
    const filledTemplate: Module[] = structuredClone(modules);

    return this.processTemplateToText(filledTemplate);
  }

  // 템플릿 샘플 모듈 조립
  assembleSampleModules(): Module[] {
    const moduleConfig = {
      basic: [
        { key: 'title', displayName: '제목' },
        { key: 'tasks', displayName: '할 일' },
        { key: 'topics', displayName: '주제' },
        { key: 'keywords', displayName: '키워드' },
        { key: 'speakerInfo', displayName: '참석자' },
        { key: 'summary', displayName: '전체 요약' },
        { key: 'issues', displayName: '이슈' },
      ],
      loop: {
        summaryTime: {
          keys: ['st_topic', 'st_summary', 'st_issues', 'st_tasks'],
          displayName: '주제별 상세 요약',
        },
      },
    };

    let moduleIndex = 0;

    const modules: Module[] = [];

    // 기본 모듈 생성
    moduleConfig.basic.forEach(({ key, displayName }) => {
      modules.push({
        index: moduleIndex++,
        moduleKey: key,
        displayName,
        items: [{ index: 0, type: 'basic', value: `{{${key}}}` }],
      });
    });

    // 루프 모듈 생성
    const createTemplateFromKeys = (keys: string[]) =>
      keys.map((key) => `{{${key}}}`).join('\n');

    Object.entries(moduleConfig.loop).map(([key, config]) =>
      modules.push({
        index: moduleIndex++,
        moduleKey: key,
        displayName: config.displayName,
        items: [
          { index: 0, type: 'basic', value: '' },
          {
            index: 1,
            type: 'loop',
            value: createTemplateFromKeys(config.keys),
          },
          { index: 2, type: 'basic', value: '' },
        ],
      }),
    );

    return modules;
  }
}
