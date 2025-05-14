"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

export default function AuctionPage() {
  const [bid, setBid] = useState("");
  const [currentBid, setCurrentBid] = useState(0);
  const [currentBidder, setCurrentBidder] = useState<string | null>(null);
  const socket = getSocket();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("🔌 Connected to socket");
    });

    socket.on("updateBid", (data: { bid: number; userId: string }) => {
      console.log("📩 New bid received", data);
      setCurrentBid(data.bid);
      setCurrentBidder(data.userId);
    });

    return () => {
      socket.off("connect");
      socket.off("updateBid");
    };
  }, [socket]);

  const handleBid = () => {
    const bidValue = parseInt(bid, 10);
    if (isNaN(bidValue)) return;
    socket.emit("bid", {
      userId: "TeamLeader1", // ← 이건 테스트용, 추후 로그인 또는 식별자로 교체
      bid: bidValue,
    });
    setBid("");
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">🏷️ 실시간 경매</h1>

      <div className="text-lg">
        현재 입찰가: <strong>{currentBid}</strong>
        <br />
        입찰자: <strong>{currentBidder || "없음"}</strong>
      </div>

      <input
        type="number"
        value={bid}
        onChange={(e) => setBid(e.target.value)}
        className="border p-2 w-full"
        placeholder="입찰 금액"
      />
      <button onClick={handleBid} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        입찰하기
      </button>
    </div>
  );
}
