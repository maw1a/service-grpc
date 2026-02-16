import type { ChannelOptions } from "@grpc/grpc-js";

import { ChannelCredentials } from "@grpc/grpc-js";

type Client<T> = {
  new (
    address: string,
    credentials: ChannelCredentials,
    options: Partial<ChannelOptions>,
  ): T;
};

export function client<T>(ServiceClient: Client<T>) {
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

    return new ServiceClient(address, credentials, options);
  };
}
