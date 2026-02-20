import { service } from "@maw1a/service-grpc";

import { GreeterServer, GreeterService } from "../../.gen/greeter";

export const Greeter = service<GreeterServer>(GreeterService, {
  sayHello: (ctx) => {
    return ctx.res.ok({ message: `hello ${ctx.req.name}` });
  },
});
