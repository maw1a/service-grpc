import type { handleServerStreamingCall } from "@grpc/grpc-js";
import type { ServerStreamingRpcFn } from "./types";

export function serverStreamingRpc<Req, Res>(
  fn: ServerStreamingRpcFn<Req, Res>,
): handleServerStreamingCall<Req, Res> {
  return async (call) => {
    fn({
      req: call.request,
      res: call,
      call,
    });
  };
}
