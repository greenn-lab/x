import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  Engine,
  MemberRole,
  Summarizer,
  SupportLang,
} from '@app/types/common/base.type';
import { AuthenticatedRequest } from '@app/types/common/request.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<MemberRole>(
      'role',
      context.getHandler(),
    );

    // @Role() 없으면 접근 허용
    if (!requiredRole) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    ////////////////////////////
    //TODO 추후 제거
    if (!request.auth) {
      request.auth = {
        isAuthorized: true,
        member: {
          role: MemberRole.OWNER,
          workspace: {
            id: '0aacac42-5808-4e33-b2e5-5c07ec362618',
          },
        },
      };
    }

    if (!request.user) {
      request.user = {
        pid: '17d7e731-a23e-54d5-99ff-1397cbdf5e27',
        email: 'test@test.com',
        nickName: 'test',
        thumbnailUrl: 'https://test.com/test.png',
        isGuest: false,
        config: {
          lang: SupportLang.KO,
          isPush: true,
          summarizer: Summarizer.OPENAI,
          transcribeEngine: Engine.CLOVA,
          transcribeLang: SupportLang.KO,
        },
        iat: 1714204800,
        exp: 1714204800,
      };
    }

    console.log(request.user);
    console.log(request.auth);
    ////////////////////////////

    const { auth } = request;

    if (!auth?.isAuthorized || !auth?.member?.role) {
      throw new UnauthorizedException('Unauthorized user');
    }

    const hasPermission = this.checkRole(requiredRole, auth.member.role);

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission for this action',
      );
    }

    return true;
  }

  private checkRole(requiredRole: MemberRole, userRole: MemberRole): boolean {
    switch (requiredRole) {
      case MemberRole.OWNER:
        return [MemberRole.OWNER].includes(userRole);
      case MemberRole.ADMIN:
        return [MemberRole.OWNER, MemberRole.ADMIN].includes(userRole);
      case MemberRole.MEMBER:
        return [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER].includes(
          userRole,
        );
      case MemberRole.GUEST:
        return [
          MemberRole.OWNER,
          MemberRole.ADMIN,
          MemberRole.MEMBER,
          MemberRole.GUEST,
        ].includes(userRole);
      default:
        return false;
    }
  }
}
