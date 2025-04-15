import { create } from "zustand";

type Player = {
  id: string;
  name: string;
  profileImage: string;
  champions: { name: string; winRate: number; gamesPlayed: number }[];
};

type PlayerStore = {
  players: Player[];
  setPlayers: (data: Player[]) => void;
};

export const usePlayerStore = create<PlayerStore>((set) => ({
  players: [],
  setPlayers: (data) => set({ players: data }),
}));
