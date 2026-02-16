import { grpc } from "@maw1a/service-grpc";

import { PORT, SERVICE_OPTIONS } from "./constants";
import { Greeter } from "./services/user";

export const server = grpc(SERVICE_OPTIONS)
  .add("greeter.Greeter", Greeter)
  .listen(`0.0.0.0:${PORT}`, async (error, port) => {
    if (error) {
      console.error(`Failed to start the server error: ${error.message}`, {
        error,
      });
      process.exit(1);
    }

    console.log(`Listening on port ${port}`);
  });
