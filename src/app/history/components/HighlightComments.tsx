"use client";

import { useEffect, useState } from "react";

type Comment = {
  author: string;
  content: string;
  createdAt: string;
};

export default function HighlightComments({ videoId }: { videoId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/highlights/${videoId}/comments`);
      if (!res.ok) {
        console.error("API Error", await res.text());
        return;
      }
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("댓글 fetch 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!videoId) return; // ✅ videoId가 없으면 호출하지 않음
    fetchComments();
  }, [videoId]);

  const handleSubmit = async () => {
    if (!author.trim() || !content.trim()) return;

    setPosting(true);
    await fetch(`/api/highlights/${videoId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, content }),
    });
    setAuthor("");
    setContent("");
    setPosting(false);
    fetchComments();
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">댓글</h3>

      {/* 댓글 입력 */}
      <div className="space-y-2 mb-4">
        <input
          type="text"
          placeholder="작성자"
          className="w-full px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700 text-white"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <textarea
          placeholder="댓글을 입력하세요"
          className="w-full px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700 text-white"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          disabled={posting}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold"
        >
          등록
        </button>
      </div>

      {/* 댓글 리스트 */}
      {loading ? (
        <div className="text-neutral-400">불러오는 중...</div>
      ) : comments.length === 0 ? (
        <div className="text-neutral-500">아직 댓글이 없습니다.</div>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment, idx) => (
            <li key={idx} className="bg-neutral-800 p-3 rounded-lg">
              <div className="text-sm font-bold mb-1">{comment.author}</div>
              <div className="text-sm text-neutral-300">{comment.content}</div>
              <div className="text-xs text-neutral-500 mt-1">{new Date(comment.createdAt).toLocaleString("ko-KR")}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
