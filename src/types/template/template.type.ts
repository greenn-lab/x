import { Template } from '@app/template/schemas/template.schema';

export interface ModuleItem {
  index: number;
  type: string;
  value: string;
}

export interface Module {
  index: number;
  moduleKey: string;
  displayName?: string;
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
