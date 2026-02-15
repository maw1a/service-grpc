import { service } from "@maw1a/service-grpc";

import { GreeterServer, GreeterService } from "examples/basic/.gen/greeter";

export const Greeter = service<GreeterServer>(GreeterService, {
  sayHello: () => {},
});
