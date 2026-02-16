import type {
  handleUnaryCall,
  Metadata,
  ServerErrorResponse,
  StatusObject,
} from "@grpc/grpc-js";

type RpcResponse<Res> = {
  err: (error: Partial<StatusObject> | ServerErrorResponse) => RpcResponse<Res>;
  ok: (res: Res) => RpcResponse<Res>;
  meta: (metadata: Metadata) => RpcResponse<Res>;
};

type RpcFn<Req, Res> = (
  req: Req,
  res: RpcResponse<Res>,
) => void | RpcResponse<Res> | Promise<void | RpcResponse<Res>>;

export function rpc<Req, Res>(fn: RpcFn<Req, Res>): handleUnaryCall<Req, Res> {
  return (call, send) => {};
}
