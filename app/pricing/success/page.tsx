import Link from "next/link";

export default function PricingSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <span className="text-4xl">🎉</span>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-3">
          프리미엄 시작됐어요!
        </h1>
        <p className="text-slate-500 mb-2">
          첫 30일은 무료입니다.
        </p>
        <p className="text-slate-400 text-sm mb-10">
          새 특판이 등록되면 이메일과 카카오톡으로 바로 알려드릴게요.
        </p>

        <div className="bg-white rounded-2xl border border-green-200 p-6 mb-6 text-left space-y-3">
          {[
            "8개 은행 특판 실시간 모니터링 ✓",
            "이메일 즉시 알림 ✓",
            "카카오톡 실시간 알림 ✓",
            "중도상환수수료 자동 계산 ✓",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-green-700 font-medium">
              {item}
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="block w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors text-center"
        >
          대시보드로 가기 →
        </Link>
      </div>
    </div>
  );
}
