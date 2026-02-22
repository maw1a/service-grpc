import type {
  handleBidiStreamingCall,
  handleClientStreamingCall,
  handleServerStreamingCall,
  handleUnaryCall,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import type { HandleCall } from "@grpc/grpc-js/build/src/server-call";
import type {
  BidiStreamingContext,
  RequestStreamingContext,
  ResponseStreamingContext,
  UnaryContext,
} from "./context";
import type { RpcResponse } from "./response";

// --- RPC Function Types ---

export type UnaryRpcFn<Req, Res> = (
  ctx: UnaryContext<Req, Res>,
) => RpcResponse<Res> | Promise<RpcResponse<Res>>;

export type ClientStreamingRpcFn<Req, Res> = (
  ctx: RequestStreamingContext<Req, Res>,
) => RpcResponse<Res> | Promise<RpcResponse<Res>>;

export type ServerStreamingRpcFn<Req, Res> = (
  ctx: ResponseStreamingContext<Req, Res>,
) => void;

export type BidiStreamingRpcFn<Req, Res> = (
  ctx: BidiStreamingContext<Req, Res>,
) => void;

// --- RPC Types ---

type ValueOf<T> = T[keyof T];

export type RpcHandlers<Req, Res> = {
  unary: UnaryRpcFn<Req, Res>;
  "client-streaming": ClientStreamingRpcFn<Req, Res>;
  "server-streaming": ServerStreamingRpcFn<Req, Res>;
  bidi: BidiStreamingRpcFn<Req, Res>;
};

type RpcTypeFromHandler<H> = H extends handleBidiStreamingCall<any, any>
  ? "bidi"
  : H extends handleClientStreamingCall<any, any>
    ? "client-streaming"
    : H extends handleServerStreamingCall<any, any>
      ? "server-streaming"
      : H extends handleUnaryCall<any, any>
        ? "unary"
        : "unary";

type PipedRpcHandler<Call extends HandleCall<any, any>> =
  Call extends HandleCall<infer Req, infer Res> ? RpcHandlers<Req, Res> : never;

export type AbstractedImplementation<U extends UntypedServiceImplementation> = {
  [Name in keyof U]: PipedRpcHandler<U[Name]>[RpcTypeFromHandler<U[Name]>];
};

type DefinitionRequest<M> = M extends {
  requestSerialize: (value: infer Req) => Buffer;
}
  ? Req
  : never;

type DefinitionResponse<M> = M extends {
  responseDeserialize: (value: Buffer) => infer Res;
}
  ? Res
  : never;

export type ServiceDefinitionLike = Record<
  string,
  {
    readonly requestStream: boolean;
    readonly responseStream: boolean;
    readonly requestSerialize: (value: unknown) => Buffer;
    readonly responseDeserialize: (value: Buffer) => unknown;
  }
>;

type RpcTypeFromDefinitionMethod<M> =
  M extends { readonly requestStream: true; readonly responseStream: true }
    ? "bidi"
    : M extends { readonly requestStream: true; readonly responseStream: false }
      ? "client-streaming"
      : M extends {
            readonly requestStream: false;
            readonly responseStream: true;
          }
        ? "server-streaming"
        : M extends {
              readonly requestStream: false;
              readonly responseStream: false;
            }
          ? "unary"
          : RpcTypes;

export type AbstractedImplementationFromDefinition<
  SD extends ServiceDefinitionLike,
> = {
  [Name in keyof SD]: RpcHandlers<
    DefinitionRequest<SD[Name]>,
    DefinitionResponse<SD[Name]>
  >[RpcTypeFromDefinitionMethod<SD[Name]>];
};

export type RpcFn = ValueOf<RpcHandlers<any, any>>;

export type RpcTypes = keyof RpcHandlers<any, any>;
