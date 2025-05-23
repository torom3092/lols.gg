"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";

export default function ResetButton() {
  useEffect(() => {
    const socket = getSocket();
    socket.on("userListUpdate", () => {});

    return () => {
      socket.off("userListUpdate");
    };
  }, []);

  const handleReset = () => {
    const confirmed = window.confirm("정말로 경매를 초기화하시겠습니까?");
    if (confirmed) {
      const socket = getSocket();
      socket.emit("resetAuction");
    }
  };

  return (
    <button onClick={handleReset} className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700">
      경매 초기화
    </button>
  );
}
