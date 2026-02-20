import { service } from "@maw1a/service-grpc";

import { v4 } from "uuid";

import {
  UserServiceServer,
  UserServiceService,
} from "examples/use-zod-schemas/.gen/user.service";

export const Greeter = service<UserServiceServer>(UserServiceService, {
  createUser(ctx) {
    return ctx.res.ok({ id: v4() });
  },
  getUser(ctx) {
    return ctx.res.ok({
      age: 25,
      email: "ahmedmawia.dev@gmail.com",
      name: "Ahmed Mawia",
    });
  },
});
