import { greeterClient } from "@maw1a/service-grpc-examples.basic/clients";

const CONFIG = {
  GREETER_SERVICE: {
    TARGET: "0.0.0.0:3000",
  },
};

export const ipc = {
  user: greeterClient(CONFIG.GREETER_SERVICE.TARGET),
};
