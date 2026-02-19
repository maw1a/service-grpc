import type {
  ChannelCredentials,
  ChannelOptions,
  Client,
  ServiceDefinition,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";

export type ListenCallback = (
  error: Error | null,
  port: number,
) => void | Promise<void>;

export type TypedServiceClient<
  U extends UntypedServiceImplementation = UntypedServiceImplementation,
> = Client & {
  [methodName in keyof U]: Function;
};

export type TypedServiceClientConstructor<
  ServiceName extends string = string,
  U extends UntypedServiceImplementation = UntypedServiceImplementation,
> = {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ChannelOptions>,
  ): TypedServiceClient<U>;
  service: ServiceDefinition<U>;
  serviceName: ServiceName;
};

export type CreateClientFunction<
  ImplementationType extends UntypedServiceImplementation =
    UntypedServiceImplementation,
> = (
  address: string,
  ...args:
    | [ChannelCredentials, Partial<ChannelOptions>]
    | [ChannelCredentials]
    | [Partial<ChannelOptions>]
    | []
) => TypedServiceClient<ImplementationType>;

export type Simplify<T> = {
  [K in keyof T]: T[K];
} & {};
