import io from "socket.io-client";

export function createOrderSocket(getAccessToken: () => string): ReturnType<typeof io> {
  const token = getAccessToken();
  return io("http://localhost:3000", {
    transports: ["websocket"],
    auth: { token },
  });
}
