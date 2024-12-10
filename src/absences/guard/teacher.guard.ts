import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Teacher, User } from 'src/users/entities/user.entity';

@Injectable()
export class TeacherGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user; // Récupérer l'utilisateur injecté par AccessTokenGuard
    console.log('User in request:', request.user);
    // Vérifiez si l'utilisateur est défini
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Vérifiez si l'utilisateur est un enseignant via le champ discriminant (type)
    if (user instanceof Teacher) {
      throw new UnauthorizedException('Access denied. User is not a teacher.');
    }

    return true; // Autoriser l'accès si l'utilisateur est un enseignant
  }
}
