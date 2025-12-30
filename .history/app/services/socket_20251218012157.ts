import io from "socket.io-client";
import type { Socket } from "socket.io-client";

export function createOrderSocket(getAccessToken: () => string): Socket {
  const token = getAccessToken();
  return io("http://localhost:3000", {
    transports: ["websocket"],
    auth: { token },
  });
}

