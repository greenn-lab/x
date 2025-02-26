import { Injectable } from '@nestjs/common';

import { Module } from '@app/types/template/template.type';

@Injectable()
export class TemplateProcessorUtil {
  constructor() {}
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
