import type { Metadata } from "@grpc/grpc-js";
import type { RpcError } from "./helpers";

export class RpcResponse<Res> {
  constructor(
    private error: RpcError,
    private value?: Res,
    private trailer?: Metadata,
    private flags?: number,
  ) {}

  err(e: RpcError) {
    return new RpcResponse<Res>(e, this.value, this.trailer, this.flags);
  }

  ok(res: Res) {
    return new RpcResponse<Res>(null, res, this.trailer, this.flags);
  }

  meta(trailer: Metadata, flags?: number) {
    return new RpcResponse<Res>(this.error, this.value, trailer, flags);
  }

  toJson(): {
    error: RpcError;
    value?: Res;
    trailer?: Metadata;
    flags?: number;
  } {
    return {
      error: this.error,
      value: this.value,
      trailer: this.trailer,
      flags: this.flags,
    };
  }
}
