import { asyncClient } from "@maw1a/service-grpc";

import { StreamingDemoClient } from "./.gen/streaming-demo";

export const streamingClient = asyncClient(StreamingDemoClient);
