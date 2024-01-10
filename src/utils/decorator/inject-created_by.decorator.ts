import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const InjectCreatedBy = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    req.body.created_by = { id: req.user.id };

    return req.body;
  },
);
