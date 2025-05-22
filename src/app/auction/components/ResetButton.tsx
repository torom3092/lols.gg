"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

export default function ResetButton( setAuctionStarted:any ) {
  useEffect(() => {
    const socket = getSocket();
    socket.on("userListUpdate", () => {});

    return () => {
      socket.off("userListUpdate");
    };
  });

  const handleReset = () => {
    const socket = getSocket();
    socket.emit("resetAuction");
    setAuctionStarted(false);
  };

  return (
    <button onClick={handleReset}  className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700">
      경매 초기화
    </button>
  );
}
