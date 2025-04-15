"use client";

import Image from "next/image";

const CHAMP_IMG_BASE = "https://ddragon.leagueoflegends.com/cdn/14.6.1/img/champion";

export default function MatchCard({ match }: { match: any }) {
  const blueTeam = match.participants.filter((p: any) => p.teamId === "blue");
  const redTeam = match.participants.filter((p: any) => p.teamId === "red");

  const date = new Date(match.gameDate).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  // 승리팀 판별 (red 중 1명이라도 win이 "Win"이면 red 승)
  const redWon = redTeam.some((p: any) => p.win === "Win");
  const blueWon = blueTeam.some((p: any) => p.win === "Win");

  // 데미지 최고 유저 찾기
  const allPlayers = [...blueTeam, ...redTeam];
  const topDamage = Math.max(...allPlayers.map((p) => Number(p.totalDamageDealtToChampions)));

  const renderPlayer = (player: any) => {
    const isTopDamage = Number(player.totalDamageDealtToChampions) === topDamage;

    return (
      <div key={player.name} className="flex items-center gap-3">
        <Image
          src={`${CHAMP_IMG_BASE}/${player.championName}.png`}
          alt={player.championName}
          width={32}
          height={32}
          className="rounded"
        />
        <div>
          <div className="text-white text-sm font-semibold">{player.name}</div>
          <div
            className={`text-xs flex flex-wrap gap-x-4 ${isTopDamage ? "text-yellow-300 font-bold" : "text-gray-300"}`}
          >
            <span>
              {player.kills} / {player.deaths} / {player.assists}
            </span>
            <span>{Number(player.totalDamageDealtToChampions).toLocaleString()} dmg</span>
            <span>{Number(player.goldEarned).toLocaleString()} gold</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4 shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{match.matchId}</h2>
        <span className="text-sm text-gray-400">{date}</span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className={`font-semibold mb-2 ${blueWon ? "text-green-400" : "text-blue-400"}`}>
            Blue Team {blueWon && "🏆"}
          </h3>
          <div className="space-y-2">{blueTeam.map(renderPlayer)}</div>
        </div>
        <div>
          <h3 className={`font-semibold mb-2 ${redWon ? "text-green-400" : "text-red-400"}`}>
            Red Team {redWon && "🏆"}
          </h3>
          <div className="space-y-2">{redTeam.map(renderPlayer)}</div>
        </div>
      </div>
    </div>
  );
}
