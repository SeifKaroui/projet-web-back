import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    // Extract the request object from the context
    const request = ctx.switchToHttp().getRequest();

    // Return the user object attached to the request
    return request.user;
  },
);
