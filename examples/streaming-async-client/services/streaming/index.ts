import { service } from "@maw1a/service-grpc";

import {
  StreamingDemoServer,
  StreamingDemoService,
} from "../../.gen/streaming-demo";

export const StreamingDemo = service<StreamingDemoServer>(
  StreamingDemoService,
  {
    echo(ctx) {
      return ctx.res.ok({ message: `echo: ${ctx.req.message}` });
    },
    sum(ctx) {
      return new Promise((resolve, reject) => {
        let total = 0;
        ctx.req.on("data", (chunk) => {
          total += chunk.value;
        });
        ctx.req.on("end", () => {
          resolve(ctx.res.ok({ total }));
        });
        ctx.req.on("error", reject);
      });
    },
    countdown(ctx) {
      for (let value = ctx.req.from; value > 0; value -= 1) {
        ctx.res.write({ value });
      }
      ctx.res.end();
    },
    chat(ctx) {
      ctx.req.on("data", (chunk: { message: string }) => {
        ctx.res.write({ message: `echo: ${chunk.message}` });
      });

      ctx.req.on("end", () => {
        ctx.res.end();
      });
    },
  },
);
