"use client";
import { useEffect } from "react";
import { io } from "socket.io-client";

export default function SocketTest() {
  useEffect(() => {
    const socket = io("https://socket-server-주소.onrender.com");

    socket.on("connect", () => {
      console.log("🟢 Connected:", socket.id);
      socket.emit("join", { userId: "태우", role: "참가자", team: "크카" });
    });

    socket.on("userListUpdate", (users) => {
      console.log("현재 유저 목록:", users);
    });

    socket.on("updateBid", ({ userId, bid }) => {
      console.log(`${userId}가 ${bid} 입찰`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>🧩 socket 연결 테스트 중</div>;
}
