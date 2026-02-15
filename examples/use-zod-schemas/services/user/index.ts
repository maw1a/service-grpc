import { service } from "@maw1a/service-grpc";

import {
  UserServiceServer,
  UserServiceService,
} from "examples/use-zod-schemas/.gen/user.service";

export const Greeter = service<UserServiceServer>(UserServiceService, {
  createUser() {},
  getUser() {},
});
