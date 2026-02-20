import { client } from "@maw1a/service-grpc";
import { UserServiceClient } from "./.gen/user.service";

export const userClient = client(UserServiceClient);
