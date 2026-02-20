import type { handleUnaryCall } from "@grpc/grpc-js";
import type { UnaryRpcFn } from "./types";

import { defaultResponse } from "./helpers";
import { RpcResponse } from "./response";

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
