import type {
  ServerDuplexStream,
  ServerReadableStream,
  ServerUnaryCall,
  ServerWritableStream,
} from "@grpc/grpc-js";
import type {
  ObjectReadable,
  ObjectWritable,
} from "@grpc/grpc-js/build/src/object-stream";
import type { RpcResponse } from "./response";

export type UnaryContext<Req, Res> = {
  req: Req;
  res: RpcResponse<Res>;
  call: ServerUnaryCall<Req, Res>;
};

export type RequestStreamingContext<Req, Res> = {
  req: ObjectReadable<Req>;
  res: RpcResponse<Res>;
  call: ServerReadableStream<Req, Res>;
};

export type ResponseStreamingContext<Req, Res> = {
  req: Req;
  res: ObjectWritable<Res>;
  call: ServerWritableStream<Req, Res>;
};

export type BidiStreamingContext<Req, Res> = {
  req: ObjectReadable<Req>;
  res: ObjectWritable<Res>;
  call: ServerDuplexStream<Req, Res>;
};
