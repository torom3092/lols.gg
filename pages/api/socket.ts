// pages/api/socket.ts
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as IOServer } from "socket.io";
import { PLAYERS, PlayerBasic } from "@/lib/players";
import { getAllPlayerStats } from "@/lib/winrate";

type Player = PlayerBasic & {
  winrateOverall?: number;
  winrateByLane?: {
    top: number | null;
    jungle: number | null;
    mid: number | null;
    adc: number | null;
    support: number | null;
  };
};

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: IOServer;
    };
  };
};

const state = {
  playerQueue: [...PLAYERS],
  currentPlayer: null as PlayerBasic | null,
  currentBid: 0,
  remainingTime: 0,
  currentBidder: null as string | null,
  biddingTimer: null as NodeJS.Timeout | null,
  countdownTimer: null as NodeJS.Timeout | null,
  teamPlayers: {} as Record<string, PlayerBasic[]>,
  bidHistory: {} as Record<string, number>,
  historyEntries: [] as { player: PlayerBasic; team: string; bid: number }[],
  userPoints: {} as Record<string, number>,
  userSocketMap: {} as Record<string, string>,
  connectedUsers: {} as Record<string, { role: string; team: string | null }>,
  fullPlayerDataMap: {} as Record<string, Player>,
};

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function emitAuctionSync(io: IOServer) {
  const payload = {
    syncedTeams: state.teamPlayers,
    syncedBids: state.bidHistory,
    syncedHistory: state.historyEntries,
  };

  io.emit("auctionSync", payload);
  io.emit("teamPanelSync", payload);
}

function startCountdown(io: IOServer) {
  let count = 5;
  state.countdownTimer = setInterval(() => {
    io.emit("countdown", { count });

    if (count === 0) {
      clearInterval(state.countdownTimer!);
      io.emit("countdown", { count: "" });

      state.currentPlayer = state.playerQueue.shift() ?? null;
      if (!state.currentPlayer) {
        io.emit("countdown", { count: "모든 플레이어 경매 완료!" });
        return;
      }

      const enriched = state.fullPlayerDataMap[state.currentPlayer.name] ?? {};
      const fullPlayer = { ...state.currentPlayer, ...enriched };
      io.emit("showPlayer", fullPlayer);
      console.log("🎯 showPlayer emit:", fullPlayer);
      startBidding(io);
    }

    count -= 1;
  }, 1000);
}

function startBidding(io: IOServer) {
  state.currentBid = 0;
  state.currentBidder = null;
  state.remainingTime = 15;

  io.emit("startBidding");

  clearInterval(state.biddingTimer!);
  state.biddingTimer = setInterval(() => {
    state.remainingTime -= 1;
    io.emit("tick", { remainingTime: state.remainingTime });

    if (state.remainingTime <= 0) {
      clearInterval(state.biddingTimer!);

      if (!state.currentBidder) {
        io.emit("playerPassed", {
          id: state.currentPlayer?.id,
          name: state.currentPlayer?.name,
        });
      } else {
        const team = state.currentBidder;
        const player = state.currentPlayer!;
        const bid = state.currentBid;

        state.teamPlayers[team] ??= [];
        state.teamPlayers[team].push(player);
        state.userPoints[team] -= bid;

        state.bidHistory[team] = (state.bidHistory[team] || 0) + bid;
        state.historyEntries.push({ player, team, bid });

        emitAuctionSync(io);

        io.emit("playerDrafted", {
          id: player.id,
          name: player.name,
        });
      }

      state.currentPlayer = null;
      state.currentBidder = null;
      state.currentBid = 0;
    }
  }, 1000);
}

function setupSocketHandlers(io: IOServer) {
  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    socket.on("join", async ({ userId, role, team }) => {
      state.userSocketMap[userId] = socket.id;
      state.userPoints[userId] ??= 1000;
      state.teamPlayers[userId] ??= [];
      state.connectedUsers[userId] = { role, team };

      if (role === "사회자" && Object.keys(state.fullPlayerDataMap).length === 0) {
        console.log("📦 플레이어 통계 정보 미리 조회 시작...");
        state.fullPlayerDataMap = await getAllPlayerStats();
        console.log("✅ 전체 플레이어 데이터 조회 완료");
      }

      console.log("✅ join 수신:", userId);
      console.log("📌 socketId 저장됨:", socket.id);
      console.log("🧩 현재 userSocketMap:", state.userSocketMap);

      io.emit("userListUpdate", state.connectedUsers);
    });

    socket.on("reconfirmJoin", ({ userId, role, team }) => {
      state.userSocketMap[userId] = socket.id;
      state.userPoints[userId] ??= 1000;
      state.teamPlayers[userId] ??= [];
      state.connectedUsers[userId] = { role, team };

      io.emit("userJoined", { userId, role, team });
      io.emit("userListUpdate", state.connectedUsers);
    });

    socket.on("startAuction", () => {
      clearInterval(state.countdownTimer!);
      clearInterval(state.biddingTimer!);

      state.playerQueue = shuffleArray([...PLAYERS]);
      state.currentPlayer = null;
      state.teamPlayers = {};
      state.bidHistory = {};
      state.historyEntries = [];

      emitAuctionSync(io);
      startCountdown(io);
    });

    socket.on("nextPlayer", () => {
      clearInterval(state.countdownTimer!);
      clearInterval(state.biddingTimer!);

      state.currentPlayer = state.playerQueue.shift() ?? null;
      if (!state.currentPlayer) {
        io.emit("countdown", { count: "모든 플레이어 경매 완료!" });
        return;
      }

      const enriched = state.fullPlayerDataMap[state.currentPlayer.name] ?? {};
      const fullPlayer = { ...state.currentPlayer, ...enriched };
      io.emit("showPlayer", fullPlayer);
      startBidding(io);
    });

    socket.on("bid", ({ userId, bid }) => {
      const point = state.userPoints[userId] ?? 0;
      if (bid > point) {
        socket.emit("bidRejected", { reason: "포인트 부족" });
        return;
      }

      state.currentBid = bid;
      state.currentBidder = userId;

      state.remainingTime = 15;

      io.emit("updateBid", {
        bid,
        userId,
        currentPlayer: state.currentPlayer,
      });

      io.emit("pointUpdate", {
        userId,
        point: point - bid,
      });
    });

    socket.on("requestInit", ({ userId }) => {
      console.log("📥 requestInit 수신:", userId);
      const socketId = state.userSocketMap[userId];
      console.log("🎯 socketId:", socketId);

      if (!socketId) {
        console.warn("❌ socketId 없음! userSocketMap에 등록 안 됨");
        return;
      }

      io.to(socketId).emit("auctionSync", {
        teams: state.teamPlayers,
        bidHistory: state.bidHistory,
        history: state.historyEntries,
      });

      io.to(socketId).emit("userListUpdate", state.connectedUsers);
    });

    socket.on("resetAuction", () => {
      console.log("🧹 경매 초기화 요청됨");

      clearInterval(state.countdownTimer!);
      clearInterval(state.biddingTimer!);

      state.playerQueue = [...PLAYERS];
      state.currentPlayer = null;
      state.currentBid = 0;
      state.currentBidder = null;
      state.biddingTimer = null;
      state.countdownTimer = null;
      state.teamPlayers = {};
      state.bidHistory = {};
      state.historyEntries = [];
      state.remainingTime = 0;

      emitAuctionSync(io);
      io.emit("auctionReset");
    });
  });
}

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket",
      cors: { origin: "*", methods: ["GET", "POST"] },
    });

    setupSocketHandlers(io);
    res.socket.server.io = io;

    console.log("🚀 Socket.IO server initialized");
  }

  res.end();
}
