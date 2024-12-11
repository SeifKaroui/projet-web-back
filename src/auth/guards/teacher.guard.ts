import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { Teacher } from 'src/users/entities/user.entity';
import { UserType } from 'src/users/enums/user-type.enum';

@Injectable()
export class TeacherGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user instanceof Teacher) {
      throw new ForbiddenException('Only teachers can access this resource');
    }

    return true;
  }
}