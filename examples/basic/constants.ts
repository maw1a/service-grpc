export const MAX_GRPC_MESSAGE_LENGTH = 1024 * 1024 * 50;
export const PORT = 3000;

export const SERVICE_OPTIONS = {
	"grpc.max_receive_message_length": MAX_GRPC_MESSAGE_LENGTH,
	"grpc.max_send_message_length": MAX_GRPC_MESSAGE_LENGTH,
};

export const CLIENT_OPTIONS = {
	"grpc.keepalive_time_ms": 10000,
	// keepalive ping timeout after 5 seconds
	"grpc.keepalive_timeout_ms": 5000,
	// allow keepalive pings when there's no gRPC calls
	"grpc.keepalive_permit_without_calls": 1,
	"grpc.max_send_message_length": MAX_GRPC_MESSAGE_LENGTH,
	"grpc.max_receive_message_length": MAX_GRPC_MESSAGE_LENGTH,
};
