import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthenticatedRequest } from '@app/types/common/request.type';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    try {
      const token = (request.headers['x-timblo-token'] as string) || null;

      if (!token) {
        throw new UnauthorizedException('Token not provided');
      }

      // verify는 gateway에서 수행
      const decoded: AuthenticatedRequest['user'] =
        this.jwtService.decode(token);
      this.logger.debug(`decoded: ${JSON.stringify(decoded)}`);

      if (!decoded || !('pid' in decoded)) {
        throw new UnauthorizedException('Invalid token');
      }

      request.user = decoded;
      request.token = token;

      return true;
    } catch (error) {
      this.logger.error(
        `Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
