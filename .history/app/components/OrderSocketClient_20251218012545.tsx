import { useEffect } from "react";
import { createOrderSocket } from "../services/socket";

export default function OrderSocketClient() {
  useEffect(() => {
    const socket = createOrderSocket(() => localStorage.getItem("access_token") || "");

    socket.on("connect", () => console.log("✅ Socket connected"));
    socket.on("socketAuthOk", (data) => console.log("Auth OK:", data));
    socket.on("socketAuthError", (err) => console.error("Auth Error:", err));
    socket.on("orderStatusChanged", (order) => {
      console.log("📦 Đơn hàng thay đổi:", order);
      // TODO: cập nhật UI hoặc dispatch Redux ở đây
    });

    return () => socket.disconnect();
  }, []);

  return null; // Component này không render UI, chỉ giữ kết nối socket
}
