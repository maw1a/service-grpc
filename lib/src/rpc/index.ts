import type {
  ServiceDefinition,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import type { BidiStreamingRpcFn } from "./bidi";
import type { ClientStreamingRpcFn } from "./client-streaming";
import type { ServerStreamingRpcFn } from "./server-streaming";
import type { UnaryRpcFn } from "./unary";

import { bidiStreamingRpc } from "./bidi";
import { clientStreamingRpc } from "./client-streaming";
import { serverStreamingRpc } from "./server-streaming";
import { unaryRpc } from "./unary";

type RpcHandlers<Req, Res> = {
  unary: UnaryRpcFn<Req, Res>;
  "client-streaming": ClientStreamingRpcFn<Req, Res>;
  "server-streaming": ServerStreamingRpcFn<Req, Res>;
  bidi: BidiStreamingRpcFn<Req, Res>;
};

type ValueOf<T> = T[keyof T];

const registry: {
  [K in keyof RpcHandlers<any, any>]: <Req, Res>(
    handler: RpcHandlers<Req, Res>[K],
  ) => void;
} = {
  unary: unaryRpc,
  "client-streaming": clientStreamingRpc,
  "server-streaming": serverStreamingRpc,
  bidi: bidiStreamingRpc,
};

export function rpc<Req, Res, K extends keyof RpcHandlers<any, any>>(
  type: K,
  handler: RpcHandlers<Req, Res>[K],
) {
  registry[type](handler);
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

export type AbstractedImplementation<U = UntypedServiceImplementation> = {
  [Name in keyof U]: RpcHandlers<any, any>[GetRpcType<U, Name>];
};
