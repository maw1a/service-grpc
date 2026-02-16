import { client } from "@maw1a/service-grpc";
import { GreeterClient } from "./.gen/greeter";

export const greeterClient = client(GreeterClient);

export default { greeterClient } as const;
