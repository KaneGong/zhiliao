import { Suspense } from "react";
import SearchContent from "./SearchContent";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="zl-workbench-page"><div className="min-h-[50vh] grid place-items-center text-slate-500">加载原料工作台...</div></div>}>
      <SearchContent />
    </Suspense>
  );
}
