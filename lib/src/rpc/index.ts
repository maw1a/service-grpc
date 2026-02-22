import type { ServiceDefinition } from "@grpc/grpc-js";
import type { RpcHandlers } from "./types";

import { bidiStreamingRpc } from "./bidi";
import { clientStreamingRpc } from "./client-streaming";
import { serverStreamingRpc } from "./server-streaming";
import { unaryRpc } from "./unary";

export type * from "./context";
export type {
  AbstractedImplementation,
  AbstractedImplementationFromDefinition,
  BidiStreamingRpcFn,
  ClientStreamingRpcFn,
  RpcFn,
  RpcTypes,
  ServiceDefinitionLike,
  ServerStreamingRpcFn,
  UnaryRpcFn,
} from "./types";

const registry = {
  unary: unaryRpc,
  "client-streaming": clientStreamingRpc,
  "server-streaming": serverStreamingRpc,
  bidi: bidiStreamingRpc,
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
  const rpcDefinition = definition[method];
  if (!rpcDefinition) return "unary";
  if (rpcDefinition.requestStream && rpcDefinition.responseStream) return "bidi";
  if (rpcDefinition.requestStream) return "client-streaming";
  if (rpcDefinition.responseStream) return "server-streaming";
  return "unary";
}
