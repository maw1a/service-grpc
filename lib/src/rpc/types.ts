import type {
  ServiceDefinition,
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

type RpcTypeFromServiceDefinition<
  SD extends ServiceDefinition,
  Name extends keyof SD,
> = SD[Name] extends { requestStream: true; responseStream: true }
  ? "bidi"
  : SD[Name] extends { requestStream: true }
    ? "client-streaming"
    : SD[Name] extends { responseStream: true }
      ? "server-streaming"
      : "unary";

type GetRpcType<U, Name extends keyof U> = RpcTypeFromServiceDefinition<
  ServiceDefinition<U>,
  Name
>;

type PipedRpcHandler<Call extends HandleCall<any, any>> =
  Call extends HandleCall<infer Req, infer Res> ? RpcHandlers<Req, Res> : never;

export type AbstractedImplementation<U extends UntypedServiceImplementation> = {
  [Name in keyof U]: PipedRpcHandler<U[Name]>[GetRpcType<U, Name>];
};

export type RpcFn = ValueOf<RpcHandlers<any, any>>;

export type RpcTypes = keyof RpcHandlers<any, any>;
