import type { ServerErrorResponse, StatusObject } from "@grpc/grpc-js";
import type { Simplify } from "../types";

type Constructor<T> = { new (...args: any[]): T };

export type RpcError = Simplify<Partial<StatusObject> | ServerErrorResponse>;

export function makeIterator<T>(arr: Array<T>): ArrayIterator<T> {
  return arr[Symbol.iterator]();
}

export const defaultResponse = <T>(
  ResponseConstructor: Constructor<T>,
  path: string,
) =>
  new ResponseConstructor(
    new Error(`RPC handler not implemented for "${path}"`),
  );
