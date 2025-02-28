import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthenticatedRequest } from '@app/types/common/request.type';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    try {
      let token = (request.headers['x-timblo-token'] as string) || null;

      if (!token) {
        if (this.config.get('NODE_ENV') === 'local') {
          token = [
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
            'eyJwaWQiOiIxN2Q3ZTczMS1hMjNlLTU0ZDUtOTlmZi0xMzk3Y2JkZjVlMjciLCJlbWFpbCI6InRlc3RAdGltYmVsLm5ldCIsIm5pY2tOYW1lIjoidGVzdCIsInRodW1ibmFpbFVybCI6Imh0dHBzOi8vdGVzdC5jb20vdGVzdC5wbmciLCJpc0d1ZXN0IjpmYWxzZSwiY29uZmlnIjp7ImxhbmciOiJrbyIsImlzUHVzaCI6dHJ1ZSwic3VtbWFyaXplciI6Ik9QRU5BSSIsInRyYW5zY3JpYmVFbmdpbmUiOiJDTE9WQSIsInRyYW5zY3JpYmVMYW5nIjoia28ifSwiaWF0IjoxNzE0MjA0ODAwLCJleHAiOjE3MTQyMDQ4MDB9',
            'u_J-Iwr7VXDsy2n4nkJCHipUkuBlzXSZ1o3-8tBW3YY',
          ].join('.');
        } else {
          throw new UnauthorizedException('Token not provided');
        }
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
