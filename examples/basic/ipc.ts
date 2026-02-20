import { userClient } from '@maw1a/service-grpc-examples.use-zod-schemas/clients'

const CONFIG = {
  USER_SERVICE: {
    TARGET: "0.0.0.0:3001",
  },
};

export const ipc = {
  user: userClient(CONFIG.USER_SERVICE.TARGET)
}