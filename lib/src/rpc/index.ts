import type {
  ServiceDefinition,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import type { HandleCall } from "@grpc/grpc-js/build/src/server-call";
import type { BidiStreamingRpcFn } from "./bidi";
import type { ClientStreamingRpcFn } from "./client-streaming";
import type { ServerStreamingRpcFn } from "./server-streaming";
import type { UnaryRpcFn } from "./unary";

import { bidiStreamingRpc } from "./bidi";
import { clientStreamingRpc } from "./client-streaming";
import { serverStreamingRpc } from "./server-streaming";
import { unaryRpc } from "./unary";

type ValueOf<T> = T[keyof T];

const registry = {
  unary: unaryRpc,
  "client-streaming": clientStreamingRpc,
  "server-streaming": serverStreamingRpc,
  bidi: bidiStreamingRpc,
};

type RpcHandlers<Req, Res> = {
  unary: UnaryRpcFn<Req, Res>;
  "client-streaming": ClientStreamingRpcFn<Req, Res>;
  "server-streaming": ServerStreamingRpcFn<Req, Res>;
  bidi: BidiStreamingRpcFn<Req, Res>;
};

export function rpc<Req, Res, K extends keyof RpcHandlers<Req, Res>>(
  type: K,
  handler: RpcHandlers<Req, Res>[K],
) {
  const rpcHandler = registry[type];
  return rpcHandler(handler as any);
}

export function getRpcType<SD extends ServiceDefinition, Name extends keyof SD>(
  definition: SD,
  method: Name,
) {
  return definition[method]
    ? "bidi"
    : definition[method]
      ? "client-streaming"
      : definition[method]
        ? "server-streaming"
        : "unary";
}

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

export type RpcFn = ValueOf<RpcHandlers<any, any>>;

export type RpcTypes = keyof RpcHandlers<any, any>;

export type GetRpcType<U, Name extends keyof U> = RpcTypeFromServiceDefinition<
  ServiceDefinition<U>,
  Name
>;

type PipedRpcHandler<Call extends HandleCall<any, any>> =
  Call extends HandleCall<infer Req, infer Res> ? RpcHandlers<Req, Res> : never;

export type AbstractedImplementation<U extends UntypedServiceImplementation> = {
  [Name in keyof U]: PipedRpcHandler<U[Name]>[GetRpcType<U, Name>];
};
