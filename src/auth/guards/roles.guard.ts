import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { MemberRole } from '@app/types/common/base.type';
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
      case MemberRole.ADMIN:
        return [MemberRole.ADMIN].includes(userRole);
      case MemberRole.OWNER:
        return [MemberRole.ADMIN, MemberRole.OWNER].includes(userRole);
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
