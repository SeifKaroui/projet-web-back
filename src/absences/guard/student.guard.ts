import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/users/entities/user.entity';  // Assurez-vous que l'import est correct
import { UserType } from 'src/users/enums/user-type.enum';

@Injectable()
export class StudentGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    console.log(user);
    // Vérifier si l'utilisateur est authentifié
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Vérifier si l'utilisateur est un étudiant
    if (user.type !== UserType.Student) {
      throw new UnauthorizedException('Access denied. User is not a Student.');
    }

    return true;
  }
}
