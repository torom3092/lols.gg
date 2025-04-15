// /types/index.ts

export type MatchParticipant = {
  PUUID: string;
  NAME?: string;
  SKIN: string;
  WIN: "Win" | "Fail";
  // 필요에 따라 더 추가 가능 (ex: KDA, 라인 등)
};

// MatchType은 한 판의 전체 데이터를 나타내는 타입
export type MatchType = {
  matchId: string;
  gameDuration: number;
  gameVersion: string;
  participants: MatchParticipant[];
};

export interface RawMatch {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameVersion: string;
    participants: {
      name: string;
      championName: string;
      kills: number;
      deaths: number;
      assists: number;
      teamId: number;
      win: boolean;
      totalDamageDealtToChampions: number;
      visionScore: number;
      goldEarned: number;
      totalMinionsKilled: number;
      summoner1Id: number;
      summoner2Id: number;
      perks: any;
    }[];
  };
}

export interface RawParticipant {
  riotIdGameName: string;
  riotIdTagline: string;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  teamId: number;
  win: boolean;
  totalDamageDealtToChampions: number;
  visionScore: number;
  goldEarned: number;
  totalMinionsKilled: number;
  summoner1Id: number;
  summoner2Id: number;
  perks: any;
}

export interface RefinedParticipant {
  name: string;
  championName: string | null;
  kills: number;
  deaths: number;
  assists: number;
  teamId: number;
  win: boolean;
  totalDamageDealtToChampions: number;
  visionScore: number;
  goldEarned: number;
  totalMinionsKilled: number;
  summoner1Id: number;
  summoner2Id: number;
  perks: any;
}

export interface RefinedMatch {
  matchId: string;
  info: RawMatch["info"] & {
    gameDate: Date;
  };
  metadata: RawMatch["metadata"];
}
