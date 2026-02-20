import { z } from "zod";

import type { ZodToProtoBufOptions } from "./types";

export const userSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
});

export const userService = {
  packageName: "user.service",
  services: {
    UserService: z.object({
      getUser: z.function({
        input: [z.object({ id: z.string().uuid() })],
        output: userSchema,
      }),
      createUser: z.function({
        input: [userSchema],
        output: z.object({ id: z.string().uuid() }),
      }),
    }),
  },
} satisfies ZodToProtoBufOptions;
