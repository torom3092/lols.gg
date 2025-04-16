"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DashboardPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const cards = [
    {
      title: " 승률 통계",
      description: "연도 및 월별 플레이어 승률 통계 보기",
      href: "/stats",
    },
    {
      title: "플레이어 통계",
      description: "업데이트 예정",
      href: "popup", // 팝업 열기 용도
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
  ];

  const handleClick = (href: string) => {
    if (href === "popup") {
      setModalOpen(true);
    } else {
      router.push(href);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 main_back">
      <h1 className="text-2xl font-bold mb-6 text-center"> 롤스기릿.gg </h1>
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
