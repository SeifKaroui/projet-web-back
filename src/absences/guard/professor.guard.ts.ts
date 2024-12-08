import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { User } from 'src/users/entities/user.entity';
import { Teacher } from 'src/users/entities/user.entity'; // Importer la classe Teacher

@Injectable()
export class ProfessorsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user; // Récupérer l'utilisateur à partir du request (généralement après validation JWT)

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Vérifier si l'utilisateur est de type 'teacher' (professeur)
    if (!(user instanceof Teacher)) {
      throw new UnauthorizedException('Access denied. User is not a professor.');
    }

    return true; // Si l'utilisateur est un professeur, permettre l'accès
  }
}
