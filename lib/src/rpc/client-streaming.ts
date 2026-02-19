import type { handleClientStreamingCall } from "@grpc/grpc-js";
import type { RequestStreamingContext } from "./context";

import { defaultResponse } from "./helpers";
import { RpcResponse } from "./response";

export type ClientStreamingRpcFn<Req, Res> = (
  ctx: RequestStreamingContext<Req, Res>,
) => RpcResponse<Res> | Promise<RpcResponse<Res>>;

export function clientStreamingRpc<Req, Res>(
  fn: ClientStreamingRpcFn<Req, Res>,
): handleClientStreamingCall<Req, Res> {
  return async (call, send) => {
    let response = fn({
      req: call,
      res: defaultResponse(RpcResponse<Res>, call.getPath()),
      call,
    });
    if (response instanceof Promise) response = await response;

    const json = response.toJson();
    send(json.error, json.value, json.trailer, json.flags);
  };
}
