import type {
  ServerOptions,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import type { Service } from "./service";
import type { ListenCallback } from "./types";

import { Server, ServerCredentials } from "@grpc/grpc-js";

export class GrpcServer<Services extends Partial<{ [name: string]: Service }>> {
  constructor(
    private _server: Server,
    private _services: Services,
  ) {}

  public add<
    Name extends string,
    ServiceImplementation extends {} = UntypedServiceImplementation,
  >(name: Name, s: Service<ServiceImplementation>) {
    type NewServices = Services & {
      [name in Name]: Service<ServiceImplementation>;
    };

    this._server.addService(s.definition, s.implementation);
    const services = { ...this._services, [name]: s } as NewServices;
    return new GrpcServer<NewServices>(this._server, services);
  }

  public listen(
    ...args:
      | [string, ServerCredentials, ListenCallback]
      | [string, ListenCallback]
  ): GrpcServer<Services> {
    if (args.length === 3) this._server.bindAsync(...args);
    else
      this._server.bindAsync(
        args[0],
        ServerCredentials.createInsecure(),
        args[1],
      );

    return this;
  }

  public get server(): Server {
    return this._server;
  }

  static create(serverOptions: ServerOptions = {}) {
    return new GrpcServer(new Server(serverOptions), {});
  }
}

export function grpc(opts?: ServerOptions) {
  return GrpcServer.create(opts);
}
