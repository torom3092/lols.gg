// lib/socket.ts
import { io, Socket } from "socket.io-client";

const URL = "https://socket-server-tm5q.onrender.com";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(URL, {
      path: "/socket.io",
      transports: ["websocket"],
    });

    // ✅ 전역 로깅: emit, on 자동 확인용
    socket.onAny((event, ...args) => {
      console.log("📨 [recv]", event, args);
    });

    const originalEmit = socket.emit.bind(socket);
    socket.emit = (...args) => {
      console.log("📤 [emit]", ...args);
      return originalEmit(...args);
    };
  }

  return socket;
}
