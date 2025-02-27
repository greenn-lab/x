import * as crypto from 'crypto';

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';

import { MemberRepository } from '@app/member/repositories/member.repository';
import { AuthenticatedRequest } from '@app/types/common/request.type';

@Injectable()
export class MemberGuard implements CanActivate {
  private readonly logger = new Logger(MemberGuard.name);

  constructor(private readonly memberRepository: MemberRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    try {
      const { user } = request;

      if (!user || !user.pid) {
        throw new UnauthorizedException('User information not found');
      }

      const member = await this.memberRepository.findByPid(user.pid);
      this.logger.debug(`member: ${JSON.stringify(member)}`);

      if (!member) {
        throw new UnauthorizedException('Member information not found');
      }

      const salt = `${member.id}${member.workspace.id}`;

      request.auth = {
        isAuthorized: true,
        member: {
          id: member.id,
          role: member.role,
          workspace: {
            id: member.workspace.id,
            domain: member.workspace.domain,
          },
        },
        kms: this.keyFromString(salt),
      };

      return true;
    } catch (error) {
      this.logger.error(
        `Authorization error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException('Authorization failed');
    }
  }

  private keyFromString(str: string, option: 'hex' | 'base64' = 'hex'): string {
    const hash = crypto.createHash('sha256');
    hash.update(str);
    return hash.digest(option);
  }
}
