import type { handleBidiStreamingCall } from "@grpc/grpc-js";
import type { BidiStreamingContext } from "./context";

export type BidiStreamingRpcFn<Req, Res> = (
  ctx: BidiStreamingContext<Req, Res>,
) => void;

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
