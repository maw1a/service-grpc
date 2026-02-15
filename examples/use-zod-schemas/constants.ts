export const MAX_GRPC_MESSAGE_LENGTH = 1024 * 1024 * 50;
export const PORT = 3001;
export const SERVICE_OPTIONS = {
  "grpc.max_receive_message_length": MAX_GRPC_MESSAGE_LENGTH,
  "grpc.max_send_message_length": MAX_GRPC_MESSAGE_LENGTH,
};
