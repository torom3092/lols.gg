// history/page.tsx
import { Suspense } from "react";
import HistoryPage from "./HistoryPage";

export default function Page() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <HistoryPage />
    </Suspense>
  );
}
