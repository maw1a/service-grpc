import { service } from "@maw1a/service-grpc";

import {
  UserServiceServer,
  UserServiceService,
} from "examples/use-zod-schemas/.gen/user.service";

import { v4 } from "uuid";
import z from "zod";
import { userSchema } from "../../schemas/user-service";

type User = z.infer<typeof userSchema>;

const UserCache = new Map<string, User>();

export const Greeter = service<UserServiceServer>(UserServiceService, {
  createUser(ctx) {
    const { age, email, name } = ctx.req;

    const id = v4();
    UserCache.set(id, { name, age, email });

    console.log({ event: "user-created", user: { id, name, age, email } });

    return ctx.res.ok({ id });
  },
  getUser(ctx) {
    const { id } = ctx.req;

    const userDetails = UserCache.get(id);

    if (!userDetails) {
      console.log({
        event: "user-fetch-failed",
        reasons: ["not-found"],
        payload: { id },
      });
      return ctx.res.err(new Error(`Failed to find user with id: ${id}`));
    }

    console.log({ event: "user-fetched", user: { id, ...userDetails } });

    return ctx.res.ok({ ...userDetails });
  },
});
