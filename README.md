# @maw1a/service-grpc

Typed helpers for building gRPC servers and clients in TypeScript on top of `@grpc/grpc-js`.

This package adds a small abstraction layer for:

- creating gRPC services with typed handler contexts
- mapping method shapes (unary/client-streaming/server-streaming/bidi) automatically
- creating regular clients (`client`) and promise-friendly streaming clients (`asyncClient`)

## Installation

```bash
pnpm add @maw1a/service-grpc @grpc/grpc-js
```

## Requirements

- Node.js 18+
- TypeScript
- Generated gRPC JS service/client stubs (for example via `ts-proto`)

This repo's examples use Buf + `stephenh-ts-proto` with:

- `outputServices=grpc-js`
- `esModuleInterop=true`

## Quick Start (Server)

```ts
import { grpc, service } from "@maw1a/service-grpc";
import { GreeterServer, GreeterService } from "./.gen/greeter";

const Greeter = service<GreeterServer>(GreeterService, {
  sayHello(ctx) {
    return ctx.res.ok({ message: `hello ${ctx.req.name}` });
  },
});

grpc()
  .add("greeter.Greeter", Greeter)
  .listen("0.0.0.0:3000", (error, port) => {
    if (error) throw error;
    console.log(`Listening on ${port}`);
  });
```

## Client APIs

### `client(ServiceClient)`

Creates a normal gRPC client factory.

```ts
import { client } from "@maw1a/service-grpc";
import { GreeterClient } from "./.gen/greeter";

const greeterClient = client(GreeterClient);
const c = greeterClient("0.0.0.0:3000");
```

### `asyncClient(ServiceClient)`

Creates an enhanced client factory with promise-based calls:

- unary methods return `Promise<Response>`
- server-streaming methods return stream + `.promise()` to collect all responses
- client-streaming methods return stream + `.writeAll(...)` + `.promise()`
- bidi-streaming methods return stream + `.writeAll(...)` + `.promise()`

```ts
import { asyncClient } from "@maw1a/service-grpc";
import { StreamingDemoClient } from "./.gen/streaming-demo";

const createClient = asyncClient(StreamingDemoClient);
const client = createClient("0.0.0.0:3002");

const unary = await client.echo({ message: "hello" });

const sumStream = client.sum();
await sumStream.writeAll([{ value: 10 }, { value: 20 }]);
const sum = await sumStream.promise();
```

`asyncClient` methods optionally accept:

- `metadata`
- call `options`
- `signal` (`AbortSignal`) to cancel requests

Errors are normalized to `Error` and gRPC `ServiceError` is wrapped as `GrpcClientError`.

## Handler Contexts

`service(...)` gives typed contexts based on RPC shape:

- unary: `{ req, res, call }`
- client-streaming: `{ req, res, call }` (`req` is readable stream)
- server-streaming: `{ req, res, call }` (`res.write(...)`, `res.end()`)
- bidi: `{ req, res, call }` (both are streams)

For unary and client-streaming handlers, return `ctx.res`:

- `ctx.res.ok(data)`
- `ctx.res.err(errorLike)`
- `ctx.res.meta(metadata, flags?)`

## Exported API

```ts
import {
  grpc,
  service,
  client,
  asyncClient,
  rpc,
  GrpcClientError,
} from "@maw1a/service-grpc";
```

Types are also exported, including client stream helper types:

- `AsyncServiceClient`
- `PromiseReadableStream`
- `PromiseWritableStream`
- `PromiseDuplexStream`
- `RpcCallConfig`

## Example Projects in This Repo

- `examples/basic`: unary server + standard client
- `examples/use-zod-schemas`: generate `.proto` from Zod schemas, then serve via this library
- `examples/streaming-async-client`: all 4 RPC shapes + `asyncClient`

## Run Examples

From repo root:

```bash
pnpm install
```

Build and run a specific example:

```bash
# Basic
pnpm --filter @maw1a/service-grpc-examples.basic run build:protos
pnpm --filter @maw1a/service-grpc-examples.basic run start

# Zod schema example
pnpm --filter @maw1a/service-grpc-examples.use-zod-schemas run build:protos
pnpm --filter @maw1a/service-grpc-examples.use-zod-schemas run start

# Streaming async example
pnpm --filter @maw1a/service-grpc-examples.streaming-async-client run build:protos
pnpm --filter @maw1a/service-grpc-examples.streaming-async-client run start
pnpm --filter @maw1a/service-grpc-examples.streaming-async-client run demo
```

## Build Library

```bash
pnpm --filter @maw1a/service-grpc run build
```
