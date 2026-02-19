import { service } from "@maw1a/service-grpc";

import {
  UserServiceServer,
  UserServiceService,
} from "examples/use-zod-schemas/.gen/user.service";

export const Greeter = service<UserServiceServer>(UserServiceService, {
  createUser(ctx) {
    return ctx.res.ok({ id: 1 });
  },
  getUser(ctx) {
    return ctx.res.ok({ id: 1 });
  },
});
