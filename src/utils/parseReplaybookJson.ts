export function parseReplaybookJson(raw: any) {
  // gameDate가 전달되었으면 그대로 사용, 없으면 1970-01-01
  const gameDate = raw.gameDate ? new Date(raw.gameDate) : new Date(0);
  const gameDuration = raw.gameDuration;

  // 참가자 정보 정제
  const participants = (raw.participants || []).map((p: any) => {
    const teamIdRaw = p.TEAM;
    const teamId = teamIdRaw === "100" ? "blue" : teamIdRaw === "200" ? "red" : "unknown";

    // name 처리: RIOT_ID_GAME_NAME이 Unknown이거나 없을 경우 NAME 사용
    const name =
      !p.RIOT_ID_GAME_NAME || p.RIOT_ID_GAME_NAME === "Unknown"
        ? p.NAME ?? "Unknown"
        : p.RIOT_ID_GAME_NAME;

    return {
      name,
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

  // matchId 생성: 이름들도 위에서 파싱한 name을 다시 써야 일관성 있음
  const matchId =
    raw.matchId && raw.matchId !== "Unknown"
      ? raw.matchId
      : `unknown-${gameDuration}-${participants.map((p:any) => p.name).join("-")}`;

  return {
    matchId,
    gameDate,
    participants,
  };
}
