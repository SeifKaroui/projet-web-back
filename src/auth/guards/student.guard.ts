import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { UserType } from 'src/users/enums/user-type.enum';
  
  @Injectable()
  export class StudentGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      // Check if the user exists and has the type 'Student'
      if (!user || user.type !== UserType.Student) {
        throw new ForbiddenException('Only students can access this resource');
      }
  
      return true;
    }
  }