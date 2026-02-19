import type { handleUnaryCall } from "@grpc/grpc-js";
import type { UnaryContext } from "./context";

import { defaultResponse } from "./helpers";
import { RpcResponse } from "./response";

export type UnaryRpcFn<Req, Res> = (
  ctx: UnaryContext<Req, Res>,
) => RpcResponse<Res> | Promise<RpcResponse<Res>>;

export function unaryRpc<Req, Res>(
  fn: UnaryRpcFn<Req, Res>,
): handleUnaryCall<Req, Res> {
  return async (call, send) => {
    let response = fn({
      req: call.request,
      res: defaultResponse(RpcResponse<Res>, call.getPath()),
      call,
    });
    if (response instanceof Promise) response = await response;

    const json = response.toJson();
    send(json.error, json.value, json.trailer, json.flags);
  };
}
