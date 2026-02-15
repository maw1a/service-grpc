import {
  ServerCredentials,
  ServerOptions,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import type { Service } from "./service";

import { Server } from "@grpc/grpc-js";

type ListenCallback = (
  error: Error | null,
  port: number,
) => void | Promise<void>;

class GrpcServer {
  private server: Server;

  constructor(serverOptions: ServerOptions = {}) {
    this.server = new Server(serverOptions);
  }

  add<T extends {} = UntypedServiceImplementation>(s: Service<T>) {
    this.server.addService(s.definition, s.implementation);
    return this;
  }

  listen(
    ...args:
      | [string, ServerCredentials, ListenCallback]
      | [string, ListenCallback]
  ) {
    if (args.length === 3) return this.server.bindAsync(...args);
    this.server.bindAsync(args[0], ServerCredentials.createInsecure(), args[1]);
  }
}

export function grpc(opts?: ServerOptions) {
  return new GrpcServer(opts);
}
