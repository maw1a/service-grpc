import type {
  CallOptions,
  ChannelOptions,
  Client,
  ClientDuplexStream,
  ClientReadableStream,
  ClientUnaryCall,
  ClientWritableStream,
  Metadata,
  ServiceError,
} from "@grpc/grpc-js";

import { ChannelCredentials } from "@grpc/grpc-js";
import { Metadata as GrpcMetadata } from "@grpc/grpc-js";

type ClientConstructor<T> = {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ChannelOptions>,
  ): T;
};

export function client<T extends Client>(ServiceClient: ClientConstructor<T>) {
  return (
    address: string,
    ...args:
      | [ChannelCredentials, Partial<ChannelOptions>]
      | [ChannelCredentials]
      | [Partial<ChannelOptions>]
      | []
  ): T => {
    let credentials: ChannelCredentials;
    let options: Partial<ChannelOptions>;

    if (args[0] instanceof ChannelCredentials) {
      credentials = args[0];
      options = args[1] || {};
    } else {
      credentials = ChannelCredentials.createInsecure();
      options = (args[0] as Partial<ChannelOptions>) || {};
    }

    const client = new ServiceClient(address, credentials, options);

    return client;
  };
}

export type RpcCallConfig = {
  metadata?: Metadata;
  options?: Partial<CallOptions>;
  signal?: AbortSignal;
};

type StreamingInput<Req> = Iterable<Req> | AsyncIterable<Req>;

export type PromiseReadableStream<Res> = ClientReadableStream<Res> & {
  promise(): Promise<Res[]>;
};

export type PromiseWritableStream<Req, Res> = ClientWritableStream<Req> & {
  promise(): Promise<Res>;
  writeAll(requests: StreamingInput<Req>): Promise<void>;
};

export type PromiseDuplexStream<Req, Res> = ClientDuplexStream<Req, Res> & {
  promise(): Promise<Res[]>;
  writeAll(requests: StreamingInput<Req>): Promise<void>;
};

type ServiceMethodDefinitionShape<Req = unknown, Res = unknown> = {
  readonly requestStream: boolean;
  readonly responseStream: boolean;
  readonly requestSerialize: (value: Req) => Buffer;
  readonly responseDeserialize: (value: Buffer) => Res;
};

type ServiceDefinitionShape = Record<string, ServiceMethodDefinitionShape>;

type AsyncMethodFromDefinition<M> =
  M extends {
    readonly requestSerialize: (value: infer Req) => Buffer;
    readonly responseDeserialize: (value: Buffer) => infer Res;
    readonly requestStream: infer ReqStream;
    readonly responseStream: infer ResStream;
  }
    ? [ReqStream, ResStream] extends [false, false]
      ? (request: Req, config?: RpcCallConfig) => Promise<Res>
      : [ReqStream, ResStream] extends [true, false]
        ? (config?: RpcCallConfig) => PromiseWritableStream<Req, Res>
        : [ReqStream, ResStream] extends [false, true]
          ? (
              request: Req,
              config?: RpcCallConfig,
            ) => PromiseReadableStream<Res>
          : [ReqStream, ResStream] extends [true, true]
            ? (config?: RpcCallConfig) => PromiseDuplexStream<Req, Res>
            : (
                requestOrConfig?: Req | RpcCallConfig,
                config?: RpcCallConfig,
              ) =>
                | Promise<Res>
                | PromiseReadableStream<Res>
                | PromiseWritableStream<Req, Res>
                | PromiseDuplexStream<Req, Res>
    : never;

export type AsyncServiceClient<
  S extends ServiceDefinitionShape = ServiceDefinitionShape,
  RawClient extends Client = Client,
> = Client & {
  raw: RawClient;
} & {
  [Method in keyof S]: AsyncMethodFromDefinition<S[Method]>;
};

type AsyncClientConstructor<
  S extends ServiceDefinitionShape = ServiceDefinitionShape,
  C extends Client = Client,
> = {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ChannelOptions>,
  ): C;
  service: S;
  serviceName: string;
};

export class GrpcClientError extends Error {
  readonly code?: number;
  readonly details?: string;
  readonly metadata?: Metadata;

  constructor(error: ServiceError) {
    super(error.details || error.message || "gRPC request failed");
    this.name = "GrpcClientError";
    this.code = error.code;
    this.details = error.details;
    this.metadata = error.metadata;
  }
}

function isServiceError(err: unknown): err is ServiceError {
  return !!err && typeof err === "object" && "code" in err;
}

function normalizeError(err: unknown): Error {
  if (isServiceError(err)) return new GrpcClientError(err);
  if (err instanceof Error) return err;
  return new Error(String(err));
}

function attachAbort(
  call: Pick<ClientUnaryCall, "cancel">,
  signal?: AbortSignal,
) {
  if (!signal) return;
  if (signal.aborted) {
    call.cancel();
    return;
  }
  const onAbort = () => call.cancel();
  signal.addEventListener("abort", onAbort, { once: true });
}

function toUnaryPromise<Req, Res>(
  method: (
    this: unknown,
    request: Req,
    metadata: Metadata,
    options: Partial<CallOptions>,
    cb: (err: ServiceError | null, value?: Res) => void,
  ) => ClientUnaryCall,
  thisArg: unknown,
  request: Req,
  config?: RpcCallConfig,
): Promise<Res> {
  return new Promise<Res>((resolve, reject) => {
    const metadata = config?.metadata;
    const options = config?.options || {};
    const finalMetadata = metadata ?? new GrpcMetadata();

    const call = method.call(
      thisArg,
      request,
      finalMetadata,
      options,
      (error, value) => {
        if (error) return reject(normalizeError(error));
        resolve(value as Res);
      },
    );
    attachAbort(call, config?.signal);
  });
}

async function writeRequests<Req>(
  stream: Pick<ClientWritableStream<Req>, "write" | "end" | "cancel">,
  requests: StreamingInput<Req>,
) {
  try {
    for await (const chunk of requests) {
      await new Promise<void>((resolve, reject) => {
        stream.write(chunk, (error?: Error | null) => {
          if (error) return reject(normalizeError(error));
          resolve();
        });
      });
    }
    stream.end();
  } catch (error) {
    stream.cancel();
    throw normalizeError(error);
  }
}

function collectStream<Res>(
  stream: Pick<ClientReadableStream<Res>, "on" | "cancel">,
  signal?: AbortSignal,
): Promise<Res[]> {
  return new Promise<Res[]>((resolve, reject) => {
    const out: Res[] = [];
    stream.on("data", (chunk: Res) => out.push(chunk));
    stream.on("end", () => resolve(out));
    stream.on("error", (error: unknown) => reject(normalizeError(error)));

    if (!signal) return;
    if (signal.aborted) {
      stream.cancel();
      reject(new Error("Request aborted"));
      return;
    }
    const onAbort = () => {
      stream.cancel();
      reject(new Error("Request aborted"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function promiseMethod<T>(factory: () => Promise<T>) {
  let pending: Promise<T> | null = null;
  return () => {
    if (!pending) pending = factory();
    return pending;
  };
}

export function asyncClient<
  const S extends ServiceDefinitionShape,
  C extends Client,
>(ServiceClient: AsyncClientConstructor<S, C>) {
  type WrappedClient = AsyncServiceClient<S, C>;

  const createClient = client(
    ServiceClient as unknown as ClientConstructor<C>,
  );

  return (
    address: string,
    ...args:
      | [ChannelCredentials, Partial<ChannelOptions>]
      | [ChannelCredentials]
      | [Partial<ChannelOptions>]
      | []
  ): WrappedClient => {
    const raw = createClient(address, ...args) as C;
    const rawMethods = raw as unknown as Record<string, unknown>;
    const wrapped = Object.create(raw) as WrappedClient;
    wrapped.raw = raw;

    for (const method of Object.keys(ServiceClient.service) as Array<keyof S>) {
      const definition = ServiceClient.service[method];
      if (!definition) continue;
      const methodName = method as string;

      if (!definition.requestStream && !definition.responseStream) {
        wrapped[method] = ((request: unknown, config?: RpcCallConfig) =>
          toUnaryPromise(
            rawMethods[methodName] as any,
            raw,
            request,
            config,
          )) as WrappedClient[typeof method];
        continue;
      }

      if (definition.requestStream && !definition.responseStream) {
        wrapped[method] = ((config?: RpcCallConfig) => {
          const metadata = config?.metadata;
          const options = config?.options || {};
          const finalMetadata = metadata ?? new GrpcMetadata();
          const methodFn = rawMethods[methodName] as unknown as (
            metadata: Metadata,
            options: Partial<CallOptions>,
            cb: (err: ServiceError | null, value?: unknown) => void,
          ) => ClientWritableStream<unknown>;

          let resolvePromise: (value: unknown) => void = () => {};
          let rejectPromise: (reason?: unknown) => void = () => {};
          const response = new Promise<unknown>((resolve, reject) => {
            resolvePromise = resolve;
            rejectPromise = reject;
          });

          const call = methodFn.call(
            raw,
            finalMetadata,
            options,
            (error, value) => {
              if (error) return rejectPromise(normalizeError(error));
              resolvePromise(value);
            },
          );
          attachAbort(call, config?.signal);

          const stream = call as PromiseWritableStream<unknown, unknown>;
          stream.promise = promiseMethod(() => response);
          stream.writeAll = async (requests: StreamingInput<unknown>) => {
            try {
              await writeRequests(stream, requests);
            } catch (error) {
              rejectPromise(normalizeError(error));
              throw error;
            }
          };
          stream.on("error", (error: unknown) => {
            rejectPromise(normalizeError(error));
          });
          return stream;
        }) as WrappedClient[typeof method];
        continue;
      }

      if (!definition.requestStream && definition.responseStream) {
        wrapped[method] = ((request: unknown, config?: RpcCallConfig) => {
          const metadata = config?.metadata;
          const options = config?.options || {};
          const finalMetadata = metadata ?? new GrpcMetadata();
          const methodFn = rawMethods[methodName] as unknown as (
            request: unknown,
            metadata: Metadata,
            options: Partial<CallOptions>,
          ) => ClientReadableStream<unknown>;

          const call = methodFn.call(raw, request, finalMetadata, options);
          const stream = call as PromiseReadableStream<unknown>;
          stream.promise = promiseMethod(() =>
            collectStream(stream, config?.signal),
          );
          return stream;
        }) as WrappedClient[typeof method];
        continue;
      }

      wrapped[method] = ((config?: RpcCallConfig) => {
        const metadata = config?.metadata;
        const options = config?.options || {};
        const finalMetadata = metadata ?? new GrpcMetadata();
        const methodFn = rawMethods[methodName] as unknown as (
          metadata: Metadata,
          options: Partial<CallOptions>,
        ) => ClientDuplexStream<unknown, unknown>;

        const call = methodFn.call(raw, finalMetadata, options);
        attachAbort(call, config?.signal);
        const stream = call as PromiseDuplexStream<unknown, unknown>;
        stream.promise = promiseMethod(() =>
          collectStream(stream, config?.signal),
        );
        stream.writeAll = (requests: StreamingInput<unknown>) =>
          writeRequests(stream, requests);
        return stream;
      }) as WrappedClient[typeof method];
    }

    return wrapped;
  };
}
