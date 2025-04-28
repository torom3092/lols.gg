"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface HighlightVideo {
  _id: string;
  title: string;
  youtubeId: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [highlight, setHighlight] = useState<HighlightVideo | null>(null);

  const cards = [
    {
      title: " 승률 통계",
      description: "연도 및 월별 플레이어 승률 통계 보기",
      href: "/stats",
    },
    {
      title: "플레이어 통계",
      description: "플레이어 통계 및 상세정보",
      href: "/player-stats", // 팝업 열기 용도
    },
    {
      title: " 관리자 페이지",
      description: "출입 금지",
      href: "/admin/login",
    },
    {
      title: " 기록실",
      description: "내전기록 롤스컵 하이라이트 모아보기",
      href: "/history",
    },
    {
      title: " 챔피언 통계",
      description: "라인별 챔피언 통계 기록",
      href: "/championStats",
    },
    {
      title: " 랭킹시스템",
      description: "라인별 승률,시너지,골드,데미지 랭킹",
      href: "/ranking",
    },
    {
      title: "팀 조합 시뮬레이터",
      description: "예정",
      href: "/",
    },
    {
      title: "상대 전적 비교",
      description: "플레이어 전적 비교",
      href: "/compare",
    },
  ];

  const handleClick = (href: string) => {
    if (href === "popup") {
      setModalOpen(true);
    } else {
      router.push(href);
    }
  };

  useEffect(() => {
    const fetchLatestHighlight = async () => {
      try {
        const res = await fetch("/api/highlights");
        const json = await res.json();
        if (json.length > 0) setHighlight(json[0]);
      } catch (err) {
        console.error("하이라이트 불러오기 실패:", err);
      }
    };

    fetchLatestHighlight();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 main_back">
      <h1 className="text-2xl font-bold mb-6 text-center"> </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={() => handleClick(card.href)}
            className="
              rounded-2xl 
              bg-white/5 
              backdrop-blur-md 
              border border-white/10 
              shadow-[0_0_24px_rgba(0,0,0,0.4)]
              transition-all hover:bg-white/10
              p-6
              cursor-pointer
            "
          >
            <h2 className="text-lg font-semibold mb-2">{card.title}</h2>
            <p className="text-sm text-gray-300">{card.description}</p>
          </div>
        ))}
      </div>

      {highlight && (
        <div className="mt-16 max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">🎯 금주의 하이라이트</h2>

          <div className="w-full aspect-video rounded-xl overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${highlight.youtubeId}`}
              className="w-full h-full"
              allowFullScreen
            />
          </div>

          <p className="mt-2 text-center text-lg font-semibold">{highlight.title}</p>
        </div>
      )}

      {/* 팝업 모달 */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">플레이어 통계</DialogTitle>
          </DialogHeader>
          <p className="text-black">업데이트 예정입니다.</p>
        </DialogContent>
      </Dialog>
    </main>
  );
}
