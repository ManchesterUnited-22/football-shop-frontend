import { io, Socket } from "socket.io-client";

export function createOrderSocket(getAccessToken: () => string): Socket {
  const token = getAccessToken(); // ví dụ: lấy từ localStorage
  return io("http://localhost:3000", {
    transports: ["websocket"], 
    auth: { token }, // gửi token khi mở socket
  });
}
