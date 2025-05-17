// lib/socket.ts
import { io, Socket } from "socket.io-client";

const URL = "https://socket-server-tm5q.onrender.com";

let socket: Socket;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(URL, {
      path: "/socket.io",
    });
  }
  return socket;
}
