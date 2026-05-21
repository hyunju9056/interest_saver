"use client";

import { useState } from "react";

export default function CheckoutButton({ isFree }: { isFree: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (isFree) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (res.status === 401) {
        window.location.href = "/signup";
      }
    } finally {
      setLoading(false);
    }
  }

  if (isFree) {
    return (
      <a
        href="/signup"
        className="block w-full text-center py-3.5 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        무료로 시작하기
      </a>
    );
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full py-3.5 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition-colors disabled:opacity-60"
    >
      {loading ? "연결 중..." : "첫 달 무료로 시작하기"}
    </button>
  );
}
