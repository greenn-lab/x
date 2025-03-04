import { Request } from 'express';

import {
  Engine,
  MemberRole,
  Summarizer,
  SupportLang,
} from '@app/types/common/base.type';

export interface AuthenticatedRequest extends Request {
  user: {
    pid: string;
    email: string;
    nickName: string;
    thumbnailUrl: string;
    isGuest: boolean;
    config: {
      lang: SupportLang;
      isPush: boolean;
      summarizer: Summarizer;
      transcribeEngine: Engine;
      transcribeLang: SupportLang;
    };
    iat: number;
    exp: number;
  };
  auth: {
    isAuthorized: boolean;
    member: {
      id?: string;
      role: MemberRole;
      workspace: {
        id: string;
        domain?: string;
      };
    };
    kms?: string;
  };
  token?: string;
}
