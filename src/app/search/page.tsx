import { Suspense } from "react";
import SearchContent from "./SearchContent";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16 text-gray-400">加载中...</div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
