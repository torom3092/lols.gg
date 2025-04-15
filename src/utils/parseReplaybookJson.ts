export function parseReplaybookJson(raw: any) {
  // gameDate가 전달되었으면 그대로 사용, 없으면 1970-01-01
  const gameDate = raw.gameDate ? new Date(raw.gameDate) : new Date(0);
  const gameDuration = raw.gameDuration;

  // matchId가 있으면 그대로 사용, 없거나 Unknown이면 생성
  const matchId =
    raw.matchId && raw.matchId !== "Unknown"
      ? raw.matchId
      : `unknown-${gameDuration}-${(raw.participants ?? [])
          .map((p: any) => p.RIOT_ID_GAME_NAME ?? "Unknown")
          .join("-")}`;

  // 참가자 정보 정제
  const participants = (raw.participants || []).map((p: any) => {
    const teamIdRaw = p.TEAM;
    const teamId = teamIdRaw === "100" ? "blue" : teamIdRaw === "200" ? "red" : "unknown";

    return {
      name: p.RIOT_ID_GAME_NAME ?? "Unknown",
      championName: p.SKIN ?? null,
      level: p.LEVEL ?? 0,
      kills: p.CHAMPIONS_KILLED ?? 0,
      deaths: p.NUM_DEATHS ?? 0,
      assists: p.ASSISTS ?? 0,
      teamId,
      win: p.WIN,
      totalDamageDealtToChampions: p.TOTAL_DAMAGE_DEALT_TO_CHAMPIONS ?? 0,
      visionScore: p.VISION_SCORE ?? 0,
      goldEarned: p.GOLD_EARNED ?? 0,
      totalMinionsKilled: p.MINIONS_KILLED ?? 0,
      position: p.INDIVIDUAL_POSITION ?? "UNKNOWN",
    };
  });

  return {
    matchId,
    gameDate,
    participants,
  };
}
