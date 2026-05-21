"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Mode = "signup" | "login";

export default function SignupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess("이메일을 확인해주세요! 인증 링크를 보내드렸어요.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        router.push("/dashboard");
      }
    }

    setLoading(false);
  }

  async function handleGoogleAuth() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* 네비게이션 */}
      <nav className="p-4 sm:p-6">
        <Link
          href="/"
          className="flex items-center gap-2 w-fit"
        >
          <span className="text-2xl">💰</span>
          <span className="font-bold text-xl text-blue-700">이자세이버</span>
        </Link>
      </nav>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              {mode === "signup" ? "무료로 시작하기" : "다시 돌아오셨군요!"}
            </h1>
            <p className="text-slate-500">
              {mode === "signup"
                ? "30초 만에 가입하고 첫 특판 알림을 받아보세요"
                : "이메일과 비밀번호로 로그인하세요"}
            </p>
          </div>

          {/* 카드 */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 p-8">
            {/* 탭 */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setMode("signup"); setError(null); setSuccess(null); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === "signup"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                회원가입
              </button>
              <button
                onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === "login"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                로그인
              </button>
            </div>

            {/* 구글 로그인 버튼 */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-50 mb-5"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 계속하기
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-slate-400 text-sm">또는</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* 이메일 폼 */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "8자 이상 입력해주세요" : "비밀번호 입력"}
                  minLength={mode === "signup" ? 8 : undefined}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              {/* 에러/성공 메시지 */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "처리 중..."
                  : mode === "signup"
                  ? "이메일로 회원가입"
                  : "로그인"}
              </button>
            </form>

            {/* 약관 */}
            {mode === "signup" && (
              <p className="text-xs text-slate-400 text-center mt-4 leading-relaxed">
                가입하면{" "}
                <a href="#" className="text-blue-500 hover:underline">이용약관</a>과{" "}
                <a href="#" className="text-blue-500 hover:underline">개인정보처리방침</a>에
                동의하는 것으로 간주됩니다.
              </p>
            )}
          </div>

          {/* 혜택 안내 */}
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span>
              <span>신용카드 불필요</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span>
              <span>무료 플랜 제공</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-green-500">✓</span>
              <span>언제든 해지</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
