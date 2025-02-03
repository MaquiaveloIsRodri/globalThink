import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const user = request.headers['x-user-role'] as string;

    if (!user || user !== 'admin') {
      throw new ForbiddenException('Access Denied');
    }

    return true;
  }
}
