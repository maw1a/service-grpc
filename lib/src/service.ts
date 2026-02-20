import type {
  ServiceDefinition,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import type { AbstractedImplementation, RpcFn, RpcTypes } from "./rpc";

import { getRpcType, rpc } from "./rpc";

export class Service<U = UntypedServiceImplementation> {
  constructor(
    public readonly definition: ServiceDefinition<U>,
    public readonly implementation: U,
  ) {}
}

export function service<U extends UntypedServiceImplementation>(
  definition: ServiceDefinition<U>,
  absImplementation: AbstractedImplementation<U>,
) {
  const implementation = Object.fromEntries(
    Object.entries(absImplementation).map(([method, handler]) => [
      method,
      rpc<any, any, RpcTypes>(
        getRpcType(definition, method as keyof U),
        handler as RpcFn,
      ),
    ]),
  ) as U;
  return new Service(definition, implementation);
}
