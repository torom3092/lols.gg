"use client";

import { useState } from "react";

export default function AddHighlightPage() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");

  const extractYoutubeId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const youtubeId = extractYoutubeId(url);
    if (!youtubeId) {
      setMessage("❌ 유효한 YouTube 링크를 입력해주세요.");
      return;
    }

    const res = await fetch("/api/highlights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, youtubeId }),
    });

    if (res.ok) {
      setMessage("✅ 등록되었습니다!");
      setTitle("");
      setUrl("");
    } else {
      setMessage("❌ 등록 실패. 다시 시도해주세요.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">🎬 하이라이트 영상 등록</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded bg-black/30 border border-white/20"
            placeholder="예: 1회차 명장면"
            required
          />
        </div>

        <div>
          <label className="block mb-1">YouTube 링크</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2 rounded bg-black/30 border border-white/20"
            placeholder="예: https://www.youtube.com/watch?v=영상ID"
            required
          />
        </div>

        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold">
          등록하기
        </button>

        {message && <p className="mt-2 text-sm">{message}</p>}
      </form>
    </div>
  );
}
