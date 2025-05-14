// pages/api/socket.ts
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as IOServer } from "socket.io";
import { PLAYERS, PlayerBasic } from "@/lib/players";

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
  currentBidder: null as string | null,
  biddingTimer: null as NodeJS.Timeout | null,
  countdownTimer: null as NodeJS.Timeout | null,
  teamPlayers: {} as Record<string, PlayerBasic[]>,
  bidHistory: {} as Record<string, number>,
  historyEntries: [] as { player: PlayerBasic; team: string; bid: number }[],
  userPoints: {} as Record<string, number>,
  userSocketMap: {} as Record<string, string>,
  connectedUsers: {} as Record<string, { role: string; team: string | null }>,
};

function emitAuctionSync(io: IOServer) {
  io.emit("auctionSync", {
    teams: state.teamPlayers,
    bidHistory: state.bidHistory,
    history: state.historyEntries,
  });
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

      io.emit("showPlayer", state.currentPlayer);
      startBidding(io);
    }

    count -= 1;
  }, 1000);
}

function startBidding(io: IOServer) {
  state.currentBid = 0;
  state.currentBidder = null;
  let remainingTime = 15;

  io.emit("startBidding");

  clearInterval(state.biddingTimer!);
  state.biddingTimer = setInterval(() => {
    remainingTime -= 1;
    io.emit("tick", { remainingTime });

    if (remainingTime <= 0) {
      clearInterval(state.biddingTimer!);

      if (!state.currentBidder) {
        io.emit("playerPassed", { player: state.currentPlayer });
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

    socket.on("join", ({ userId, role, team }) => {
      state.userSocketMap[userId] = socket.id;
      state.userPoints[userId] ??= 1000;
      state.teamPlayers[userId] ??= [];
      state.connectedUsers[userId] = { role, team };

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

      state.playerQueue = [...PLAYERS];
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

      io.emit("showPlayer", state.currentPlayer);
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
      const socketId = state.userSocketMap[userId];
      if (!socketId) return;

      io.to(socketId).emit("auctionSync", {
        teams: state.teamPlayers,
        bidHistory: state.bidHistory,
        history: state.historyEntries,
      });

      io.to(socketId).emit("userListUpdate", state.connectedUsers);
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
