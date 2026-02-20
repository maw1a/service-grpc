import type { handleBidiStreamingCall } from "@grpc/grpc-js";
import type { BidiStreamingRpcFn } from "./types";

export function bidiStreamingRpc<Req, Res>(
  fn: BidiStreamingRpcFn<Req, Res>,
): handleBidiStreamingCall<Req, Res> {
  return async (call) => {
    fn({
      req: call,
      res: call,
      call,
    });
  };
}
