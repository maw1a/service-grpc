import type { handleServerStreamingCall } from "@grpc/grpc-js";
import type { ResponseStreamingContext } from "./context";

export type ServerStreamingRpcFn<Req, Res> = (
  ctx: ResponseStreamingContext<Req, Res>,
) => void;

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
