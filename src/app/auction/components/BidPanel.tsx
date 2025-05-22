"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import ResetButton from "./ResetButton";

export default function BidPanel({
  role,
  team,
  userId,
}: {
  role: string | null;
  team: string | null;
  userId: string | null;
}) {
  const socket = getSocket();
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [bidAmount, setBidAmount] = useState("0");
  const [pointsLeft, setPointsLeft] = useState(1000);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState<string | null>(null);
  const [joinLog, setJoinLog] = useState<string[]>([]);
  const [countdownText, setCountdownText] = useState<string | null>(null);
  const [auctionPhase, setAuctionPhase] = useState<
    "waiting" | "showingPlayer" | "bidding"
  >("waiting");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/^0+/, "");
    const numeric = value.replace(/\D/g, "");
    setBidAmount(numeric === "" ? "0" : numeric);
  };

  const increment = (amount: number) => {
    const next = parseInt(bidAmount || "0") + amount;
    setBidAmount(String(next));
  };

  const handleBid = () => {
    const amount = parseInt(bidAmount);
    if (amount > 0) {
      socket.emit("bid", { userId: userId ?? "unknown", bid: amount });
      setBidAmount("0");
    }
  };

  const hasEmittedRef = useRef(false);

  useEffect(() => {
    const handleUserJoined = ({ userId, role, team }: any) => {
      const msg = `${userId} (${role}${
        team ? ` / ${team}` : ""
      }) 님이 접속하셨습니다`;
      setJoinLog((prev) => [...prev, msg]);
    };

    socket.off("userJoined");
    socket.on("userJoined", handleUserJoined);

    if (!hasEmittedRef.current && userId) {
      socket.emit("reconfirmJoin", { userId, role, team });
      hasEmittedRef.current = true;
    }

    return () => {
      socket.off("userJoined", handleUserJoined);
    };
  }, [userId, role, team]);

  useEffect(() => {
    const handleTick = (data: { remainingTime: number }) => {
      setRemainingTime(data.remainingTime);
    };

    const handleCountdown = ({ count }: any) => {
      setCountdownText(typeof count === "number" ? String(count) : count);
    };

    const handleStartBidding = () => {
      setAuctionPhase("bidding");
      setRemainingTime(15);
    };

    const handlePlayerPassed = () => {
      setJoinLog((prev) => [
        ...prev,
        "😢 유찰되었습니다. 다음 사람으로 넘어갑니다.",
      ]);
      setAuctionPhase("waiting");
      setRemainingTime(null);
    };

    const handleUpdateBid = ({ bid, userId }: any) => {
      setHighestBid(bid);
      setHighestBidder(userId);
      const msg = `📢 ${userId}님이 ${bid} 포인트로 입찰했습니다`;
      setJoinLog((prev) => [...prev, msg]);
    };

    const handlePointUpdate = ({ userId: targetId, point }: any) => {
      if (targetId === userId) {
        setPointsLeft(point);
      }
    };

    const handleChatMessage = (msg: string) => {
      setJoinLog((prev) => [...prev, msg]);
    };

    socket.on("tick", handleTick);
    socket.on("countdown", handleCountdown);
    socket.on("startBidding", handleStartBidding);
    socket.on("playerPassed", handlePlayerPassed);
    socket.on("updateBid", handleUpdateBid);
    socket.on("pointUpdate", handlePointUpdate);
    socket.on("chatMessage", handleChatMessage);

    return () => {
      socket.off("tick", handleTick);
      socket.off("countdown", handleCountdown);
      socket.off("startBidding", handleStartBidding);
      socket.off("playerPassed", handlePlayerPassed);
      socket.off("updateBid", handleUpdateBid);
      socket.off("pointUpdate", handlePointUpdate);
      socket.off("chatMessage", handleChatMessage);
    };
  }, [userId]);

  return (
    <div className="bg-blue-900 text-white p-4 rounded space-y-4 w-full max-w-xl text-center">
      <div className="bg-gray-700 w-full text-center py-2 rounded h-32 overflow-y-auto">
        {joinLog.map((msg, idx) =>
          msg === "----------" ? (
            <hr key={idx} className="border-t border-yellow-300 my-2" />
          ) : (
            <p key={idx} className="text-sm text-yellow-300">
              {msg}
            </p>
          )
        )}
        {countdownText && (
          <div className="text-3xl font-extrabold text-red-400">
            ⏱️ {countdownText}
          </div>
        )}
      </div>

      <div className="bg-yellow-400 text-black font-bold text-xl py-2 rounded">
        {remainingTime !== null
          ? `TIME COUNT ${remainingTime}`
          : "TIME COUNT 대기 중"}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[5, 10, 50, 100].map((amt) => (
          <button
            key={amt}
            onClick={() => increment(amt)}
            className="bg-white text-black font-semibold py-2 rounded hover:bg-gray-200"
          >
            +{amt}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 items-center">
        <div className="bg-white text-black py-2 rounded font-semibold">
          잔여 포인트 <span className="ml-2">{pointsLeft}</span>
        </div>
        <input
          type="text"
          value={bidAmount}
          onChange={handleInputChange}
          className="py-2 px-2 text-black rounded text-center font-bold"
          placeholder="포인트 입력"
        />
        <button
          onClick={handleBid}
          className="bg-sky-500 hover:bg-sky-600 py-2 rounded font-bold"
        >
          입찰
        </button>

        {role === "host" && !auctionStarted && (
          <button
            onClick={() => {
              socket.emit("startAuction");
              setAuctionStarted(true); // ✅ 추가
            }}
            className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded font-bold"
          >
            🎬 경매 시작
          </button>
        )}

        {role === "host" && (
          <>
            <button
              onClick={() => socket.emit("nextPlayer")}
              className="bg-purple-500 hover:bg-purple-600 px-6 py-2 rounded font-bold"
            >
              ⏭️ 다음 사람
            </button>

            <ResetButton
     
              setAuctionStarted={setAuctionStarted}
            />
            <button
              className="bg-purple-500 hover:bg-purple-600 px-6 py-2 rounded font-bold"
              onClick={() => socket.emit("startBidding")}
            >
              입찰 시작
            </button>
          </>
        )}
      </div>
    </div>
  );
}
