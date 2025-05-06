import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import CHAMPION_KR_MAP from "@/lib/championNameKo";

export async function GET(req: NextRequest, context: any) {
  const alias = (await context.params).alias;

  if (!alias || alias === "null") {
    return NextResponse.json({ error: "잘못된 alias입니다." }, { status: 400 });
  }
  const client = await connectToDB();
  const db = client.db("내전GG");

  const player = await db.collection("players").findOne({ alias });
  if (!player) {
    return NextResponse.json({ error: "해당 플레이어를 찾을 수 없습니다." }, { status: 404 });
  }

  const nicknames = player.nicknames;
  const matches = await db.collection("matches").find().toArray();

  const champStats: Record<
    string,
    {
      wins: number;
      losses: number;
      kills: number;
      deaths: number;
      assists: number;
      damage: number;
      gold: number;
    }
  > = {};

  for (const match of matches) {
    const date = new Date(match.gameDate);
    if (date.getFullYear() !== 2025) continue;

    for (const p of match.participants || []) {
      if (!nicknames.includes(p.name)) continue;

      const champ = p.championName;
      if (!champ) continue;

      if (!champStats[champ]) {
        champStats[champ] = {
          wins: 0,
          losses: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
          damage: 0,
          gold: 0,
        };
      }

      const s = champStats[champ];

      if (p.win === "Win") s.wins++;
      else s.losses++;

      s.kills += Number(p.kills || 0);
      s.deaths += Number(p.deaths || 0);
      s.assists += Number(p.assists || 0);
      s.damage += Number(p.totalDamageDealtToChampions || 0);
      s.gold += Number(p.goldEarned || 0);
    }
  }

  const result = Object.entries(champStats).map(([championName, stat]) => {
    const total = stat.wins + stat.losses;
    const kda = stat.deaths === 0 ? stat.kills + stat.assists : (stat.kills + stat.assists) / stat.deaths;

    return {
      championName,
      championKR: CHAMPION_KR_MAP[championName] || championName,
      imageUrl: `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${championName}.png`,
      wins: stat.wins,
      losses: stat.losses,
      games: total,
      winrate: total > 0 ? Math.round((stat.wins / total) * 100) : 0,
      kda: Number(kda.toFixed(2)),
      avgDamage: Math.round(stat.damage / total),
      avgGold: Math.round(stat.gold / total),
    };
  });

  if (result.length > 0) {
    const total = result.reduce(
      (acc, curr) => {
        acc.wins += curr.wins;
        acc.losses += curr.losses;
        acc.kills += curr.kda * curr.games;
        acc.games += curr.games;
        acc.damage += curr.avgDamage * curr.games;
        acc.gold += curr.avgGold * curr.games;
        return acc;
      },
      { wins: 0, losses: 0, kills: 0, games: 0, damage: 0, gold: 0 }
    );

    const totalDeaths = total.games; // KDA 계산 기준: 판수 = 평균 1 death
    const avgKDA = totalDeaths === 0 ? total.kills : total.kills / totalDeaths;

    result.unshift({
      championName: "Total",
      championKR: "모든 챔피언",
      imageUrl: "/icons/lol.png",
      wins: total.wins,
      losses: total.losses,
      games: total.games,
      winrate: Math.round((total.wins / total.games) * 100),
      kda: Number(avgKDA.toFixed(2)),
      avgDamage: Math.round(total.damage / total.games),
      avgGold: Math.round(total.gold / total.games),
    });
  }

  return NextResponse.json(result);
}
