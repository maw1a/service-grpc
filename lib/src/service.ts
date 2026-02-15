import type {
  ServiceDefinition,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";

export class Service<U = UntypedServiceImplementation> {
  constructor(
    public readonly definition: ServiceDefinition<U>,
    public readonly implementation: U,
  ) {}
}

export function service<U = UntypedServiceImplementation>(
  definition: ServiceDefinition<U>,
  implementation: U,
) {
  return new Service(definition, implementation);
}
