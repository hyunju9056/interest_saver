"use client";

import { useState } from "react";
import Link from "next/link";

export default function AlertToggle() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
        <span className="text-xl">🔔</span> 알림 설정
      </h2>

      <div className="flex items-center justify-between py-3 border-b border-slate-100">
        <div>
          <p className="font-semibold text-slate-800 text-sm">이메일 알림</p>
          <p className="text-xs text-slate-500 mt-0.5">새 특판이 등록되면 이메일로 알려드려요</p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            enabled ? "bg-blue-600" : "bg-slate-200"
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              enabled ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <p className="text-xs text-blue-600 mt-2 font-medium">
          ✓ 이메일 알림이 활성화되었어요
        </p>
      )}

      {/* 프리미엄 배너 */}
      <Link href="/pricing" className="mt-4 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl px-4 py-3 hover:from-blue-700 hover:to-blue-800 transition-all group">
        <div>
          <p className="text-white font-bold text-sm">카카오톡 즉시 알림</p>
          <p className="text-blue-200 text-xs mt-0.5">프리미엄에서 실시간으로 받아보세요</p>
        </div>
        <span className="text-white text-lg group-hover:translate-x-0.5 transition-transform">→</span>
      </Link>
    </div>
  );
}
