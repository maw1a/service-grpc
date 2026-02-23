# @maw1a/service-grpc

A lightweight TypeScript layer for building `@grpc/grpc-js` services with clearer handler contracts and cleaner client ergonomics.

It keeps the core gRPC runtime intact while adding:

- typed service construction from generated service definitions
- request/response helpers for unary and client-streaming handlers
- optional promise-style client wrappers for unary and streaming RPCs
- support for all four RPC patterns: unary, client streaming, server streaming, and bidirectional streaming

## Install

```bash
pnpm add @maw1a/service-grpc @grpc/grpc-js
```

## Prerequisites

- Node.js 18+
- TypeScript
- generated gRPC service/client code (for example, `ts-proto` + `grpc-js` output)

## Why use this package

`@grpc/grpc-js` is flexible but low-level. This library adds a small abstraction focused on DX:

- `service(...)` converts your method map into a gRPC implementation with typed `ctx`
- `grpc()` provides a chainable server builder (`add(...).listen(...)`)
- `client(...)` returns a straightforward typed client factory
- `asyncClient(...)` wraps generated clients with Promise-based APIs for unary and streams

## Quick Example

```ts
import { grpc, service, client } from "@maw1a/service-grpc";
import { GreeterServer, GreeterService, GreeterClient } from "./.gen/greeter";

const Greeter = service<GreeterServer>(GreeterService, {
  sayHello(ctx) {
    return ctx.res.ok({ message: `hello ${ctx.req.name}` });
  },
});

grpc()
  .add("greeter.Greeter", Greeter)
  .listen("0.0.0.0:3000", (error, port) => {
    if (error) throw error;
    console.log(`listening on ${port}`);
  });

const createGreeterClient = client(GreeterClient);
const greeter = createGreeterClient("0.0.0.0:3000");
```

## Server API

### `service(definition, handlers)`

Builds a service implementation from a generated service definition.

Handler signatures are inferred from RPC type:

- unary: `(ctx) => RpcResponse | Promise<RpcResponse>`
- client streaming: `(ctx) => RpcResponse | Promise<RpcResponse>`
- server streaming: `(ctx) => void`
- bidi streaming: `(ctx) => void`

Context fields:

- `ctx.req`: request value or readable stream (depending on RPC type)
- `ctx.res`: response helper (`ok`, `err`, `meta`) or writable stream
- `ctx.call`: raw gRPC call object

### `grpc(options?)`

Creates a `GrpcServer` instance.

Common chain:

```ts
grpc(options)
  .add("package.ServiceName", serviceInstance)
  .listen("0.0.0.0:3000", callback);
```

If credentials are not provided in `listen`, insecure server credentials are used.

## Client API

### `client(GeneratedClient)`

Creates a client factory that returns the generated `grpc-js` client.

- defaults to insecure channel credentials
- accepts optional channel credentials and channel options

### `asyncClient(GeneratedClient)`

Creates a Promise-friendly wrapper around a generated client.

Method behavior:

- unary -> returns `Promise<Res>`
- server streaming -> returns stream with `.promise(): Promise<Res[]>`
- client streaming -> returns stream with `.writeAll(...)` and `.promise(): Promise<Res>`
- bidi streaming -> returns duplex stream with `.writeAll(...)` and `.promise(): Promise<Res[]>`

Per-call config supports:

- `metadata`
- `options` (`CallOptions`)
- `signal` (`AbortSignal`) for cancellation

Errors from gRPC calls are wrapped as `GrpcClientError` when possible.

## Package Exports

Runtime exports:

- `grpc`
- `service`
- `rpc`
- `client`
- `asyncClient`
- `GrpcClientError`

Type exports include:

- `GrpcServer`
- `Service`
- `AsyncServiceClient`
- `PromiseReadableStream`
- `PromiseWritableStream`
- `PromiseDuplexStream`
- `RpcCallConfig`
- RPC context and handler helper types

## Links

- Repository: https://github.com/maw1a/service-grpc
- Issues: https://github.com/maw1a/service-grpc/issues
- Discussions: https://github.com/maw1a/service-grpc/discussions

## License

ISC
