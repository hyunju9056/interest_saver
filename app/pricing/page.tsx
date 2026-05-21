import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import CheckoutButton from "./CheckoutButton";
import ManageButton from "./ManageButton";

const FREE_FEATURES = [
  "대시보드에서 특판 직접 확인",
  "이자 절감 계산기",
  "대출 정보 저장 1개",
  "주 1회 특판 업데이트",
];

const PREMIUM_FEATURES = [
  "무료 플랜의 모든 기능",
  "새 특판 이메일 즉시 알림",
  "카카오톡 실시간 알림",
  "8개 은행 실시간 업데이트",
  "중도상환 수수료 자동 계산",
  "우선 고객 지원",
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const params = await searchParams;

  let user = null;
  let isPremium = false;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith('your_')) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;
    if (user) {
      const { data } = await supabase
        .from("users")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();
      isPremium = data?.subscription_tier === "premium";
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 네비게이션 */}
      <nav className="bg-white/80 backdrop-blur border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="font-bold text-xl text-blue-700">이자세이버</span>
          </Link>
          {user ? (
            <Link href="/dashboard" className="text-sm text-slate-600 hover:text-blue-700 font-medium">
              대시보드로 →
            </Link>
          ) : (
            <Link href="/signup" className="text-sm bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              시작하기
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">
            합리적인 가격
          </h1>
          <p className="text-slate-500 text-lg">
            커피 한 잔 값으로 연 100만원 이상 아끼세요
          </p>
        </div>

        {/* 결제 취소 안내 */}
        {params.canceled && (
          <div className="max-w-lg mx-auto mb-8 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-amber-700 text-sm text-center">
            결제가 취소되었습니다. 언제든지 다시 시도할 수 있어요.
          </div>
        )}

        {/* 현재 구독 상태 배너 */}
        {isPremium && (
          <div className="max-w-lg mx-auto mb-10 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-bold text-green-800 text-sm">프리미엄 구독 중</p>
                <p className="text-green-600 text-xs mt-0.5">모든 기능을 이용하고 있어요</p>
              </div>
            </div>
            <Link href="/dashboard" className="text-sm text-green-700 font-bold hover:underline">
              대시보드 →
            </Link>
          </div>
        )}

        {/* 플랜 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* 무료 플랜 */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 flex flex-col">
            <div className="mb-6">
              <div className="font-bold text-slate-400 text-xs mb-2 tracking-wider">FREE</div>
              <div className="text-4xl font-black text-slate-900">무료</div>
              <div className="text-slate-400 text-sm mt-1">영원히 무료</div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <CheckoutButton isFree={true} />
          </div>

          {/* 프리미엄 플랜 */}
          <div className="bg-blue-600 rounded-2xl border-2 border-blue-500 p-8 relative flex flex-col shadow-2xl shadow-blue-200">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-green-400 text-green-900 text-xs font-black px-4 py-1.5 rounded-full whitespace-nowrap">
              🎉 첫 달 무료
            </div>

            <div className="mb-6">
              <div className="font-bold text-blue-200 text-xs mb-2 tracking-wider">PREMIUM</div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-white">4,900원</span>
                <span className="text-blue-300 mb-1">/월</span>
              </div>
              <div className="text-blue-300 text-sm mt-1">첫 달 무료 · 언제든 해지</div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {PREMIUM_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white">
                  <span className="text-green-300 font-bold mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {isPremium ? (
              <ManageButton />
            ) : (
              <CheckoutButton isFree={false} />
            )}
          </div>
        </div>

        {/* 신뢰 지표 */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>🔒</span> Stripe 보안 결제
          </div>
          <div className="flex items-center gap-1.5">
            <span>📅</span> 언제든지 해지 가능
          </div>
          <div className="flex items-center gap-1.5">
            <span>💳</span> 신용카드/체크카드
          </div>
          <div className="flex items-center gap-1.5">
            <span>🇰🇷</span> 한국어 결제 지원
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-black text-slate-900 text-center mb-6">결제 관련 FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: "첫 달 무료란 무엇인가요?",
                a: "프리미엄 구독 시작 후 30일 동안 무료로 이용하실 수 있습니다. 30일 이내에 해지하시면 요금이 청구되지 않습니다.",
              },
              {
                q: "해지하면 바로 이용이 중단되나요?",
                a: "아니요. 결제 기간이 끝날 때까지는 프리미엄 기능을 계속 이용하실 수 있습니다.",
              },
              {
                q: "환불이 가능한가요?",
                a: "결제 후 7일 이내에는 전액 환불이 가능합니다. 고객 지원으로 연락주세요.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-5">
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex gap-2">
                  <span className="text-blue-500">Q.</span> {item.q}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed pl-5">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
