import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from 'src/auth/interfaces/jwt-user.interface';

export const GetUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtUser => {
    // Extract the request object from the context
    const request = ctx.switchToHttp().getRequest();

    // Return the user object attached to the request
    return request.user;
  },
);
