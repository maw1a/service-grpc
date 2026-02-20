import type { ChannelOptions, Client } from "@grpc/grpc-js";

import { ChannelCredentials } from "@grpc/grpc-js";

type ClientConstructor<T> = {
  new (
    address: string,
    credentials: ChannelCredentials,
    options: Partial<ChannelOptions>,
  ): T;
};

export function client<T extends Client>(ServiceClient: ClientConstructor<T>) {
  return (
    address: string,
    ...args:
      | [ChannelCredentials, Partial<ChannelOptions>]
      | [ChannelCredentials]
      | [Partial<ChannelOptions>]
      | []
  ): T => {
    const credentials =
      args[0] instanceof ChannelCredentials
        ? args[0]
        : ChannelCredentials.createInsecure();
    const options = args[1] || {};

    const client = new ServiceClient(address, credentials, options);

    return client;
  };
}
