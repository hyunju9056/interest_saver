"use client";

import { useState } from "react";

export default function ManageButton() {
  const [loading, setLoading] = useState(false);

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePortal}
      disabled={loading}
      className="w-full py-3.5 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 transition-colors disabled:opacity-60"
    >
      {loading ? "연결 중..." : "구독 관리하기"}
    </button>
  );
}
