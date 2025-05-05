// /lib/normalizeChampionName.ts

const correctionMap: Record<string, string> = {
  FiddleSticks: "Fiddlesticks",
  Wukong: "MonkeyKing",
  // 필요한 다른 예외 케이스 추가 가능
};

export function normalizeChampionName(name: string) {
  return correctionMap[name] || name;
}
