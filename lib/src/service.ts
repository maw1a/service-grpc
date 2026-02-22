import type {
  ServiceDefinition,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import type {
  AbstractedImplementation,
  AbstractedImplementationFromDefinition,
  RpcFn,
  RpcTypes,
  ServiceDefinitionLike,
} from "./rpc";

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
): Service<U>;
export function service<SD extends ServiceDefinitionLike>(
  definition: SD,
  absImplementation: AbstractedImplementationFromDefinition<SD>,
): Service;
export function service(
  definition: ServiceDefinitionLike,
  absImplementation: Record<string, RpcFn>,
) {
  const implementation = Object.fromEntries(
    Object.entries(absImplementation).map(([method, handler]) => [
      method,
      rpc<any, any, RpcTypes>(
        getRpcType(
          definition as unknown as ServiceDefinition,
          method as keyof typeof definition,
        ),
        handler as RpcFn,
      ),
    ]),
  ) as UntypedServiceImplementation;
  return new Service(
    definition as unknown as ServiceDefinition,
    implementation,
  );
}
