import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserToken } from 'src/auth/strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserToken => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: UserToken }>();
    return request.user;
  },
);
