import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserType } from 'src/users/enums/user-type.enum';

@Injectable()
export class TeacherGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if the user exists and has the type 'Teacher'
    if (!user || user.type !== UserType.Teacher) {
      throw new ForbiddenException('Only teachers can access this resource');
    }

    return true;
  }
}