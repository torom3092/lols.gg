"use client";

import { useEffect, useState } from "react";

interface HighlightVideo {
  _id: string;
  title: string;
  youtubeId: string;
  createdAt: string;
}

export default function HighlightTab() {
  const [videos, setVideos] = useState<HighlightVideo[]>([]);
  const [page, setPage] = useState(1);
  const limit = 2;

  useEffect(() => {
    const fetchVideos = async () => {
      const res = await fetch("/api/highlights");
      const json = await res.json();
      setVideos(json);
    };

    fetchVideos();
  }, []);

  const totalPages = Math.ceil(videos.length / limit);
  const paginated = videos.slice((page - 1) * limit, page * limit);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-center">🎞 하이라이트</h2>

      {paginated.length === 0 ? (
        <p className="text-center text-gray-400">등록된 영상이 없습니다.</p>
      ) : (
        paginated.map((v) => (
          <div key={v._id} className="mb-8">
            <h3 className="mb-2 text-lg font-semibold">{v.title}</h3>
            <div className="w-full aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${v.youtubeId}`}
                className="w-full h-full rounded-xl"
                allowFullScreen
              />
            </div>
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
          >
            이전
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
