import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SavingsCalculator from "./SavingsCalculator";
import AlertToggle from "./AlertToggle";
import GuestDashboard from "./GuestDashboard";
import { calcMonthlyPayment, calcRemainingBalance, type LoanInfo, type RepaymentType } from "@/lib/loanCalc";

const BANK_COLORS: Record<string, string> = {
  KB국민은행: "bg-amber-50 text-amber-700 border-amber-200",
  신한은행: "bg-blue-50 text-blue-700 border-blue-200",
  우리은행: "bg-cyan-50 text-cyan-700 border-cyan-200",
  하나은행: "bg-emerald-50 text-emerald-700 border-emerald-200",
  NH농협은행: "bg-green-50 text-green-700 border-green-200",
  IBK기업은행: "bg-sky-50 text-sky-700 border-sky-200",
  "SC제일은행": "bg-teal-50 text-teal-700 border-teal-200",
  카카오뱅크: "bg-yellow-50 text-yellow-700 border-yellow-200",
  토스뱅크: "bg-indigo-50 text-indigo-700 border-indigo-200",
  K뱅크: "bg-purple-50 text-purple-700 border-purple-200",
  부산은행: "bg-rose-50 text-rose-700 border-rose-200",
  경남은행: "bg-orange-50 text-orange-700 border-orange-200",
  "대구은행(iM뱅크)": "bg-lime-50 text-lime-700 border-lime-200",
  광주은행: "bg-pink-50 text-pink-700 border-pink-200",
  전북은행: "bg-violet-50 text-violet-700 border-violet-200",
  제주은행: "bg-cyan-50 text-cyan-700 border-cyan-200",
  수협은행: "bg-blue-50 text-blue-700 border-blue-200",
  SBI저축은행: "bg-slate-50 text-slate-700 border-slate-200",
  OK저축은행: "bg-slate-50 text-slate-700 border-slate-200",
  웰컴저축은행: "bg-slate-50 text-slate-700 border-slate-200",
  페퍼저축은행: "bg-red-50 text-red-700 border-red-200",
  애큐온저축은행: "bg-slate-50 text-slate-700 border-slate-200",
  다올저축은행: "bg-slate-50 text-slate-700 border-slate-200",
};

function getDaysLeft(endDate: string) {
  const diff = Math.ceil(
    (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

export default async function DashboardPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured = supabaseUrl && !supabaseUrl.startsWith('your_');

  // 비로그인 게스트 모드
  if (!isSupabaseConfigured) return <GuestDashboard />;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 로그인 안 된 경우 게스트 대시보드
  if (!user) return <GuestDashboard />;

  const [{ data: loans }, { data: offers }] = await Promise.all([
    supabase
      .from("loans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("special_offers")
      .select("*")
      .eq("is_active", true)
      .order("rate", { ascending: true }),
  ]);

  const loan = loans?.[0] ?? null;
  if (!loan) return <GuestDashboard />;

  const loanInfo: LoanInfo = {
    originalAmount: loan.loan_amount,
    annualRate: loan.current_rate,
    repaymentType: (loan.repayment_type as RepaymentType) ?? "원리금균등",
    loanStartDate: loan.loan_start_date ?? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    loanTermYears: loan.loan_term_years ?? 30,
    earlyRepaymentFeeRate: loan.early_repayment_fee_rate ?? 1.2,
    earlyRepaymentFeeMonths: loan.early_repayment_fee_months ?? 36,
  };
  const monthlyPayment = Math.round(calcMonthlyPayment(loanInfo));
  const remainingBalance = calcRemainingBalance(loanInfo);
  const loanAmountEok = (remainingBalance / 100000000).toFixed(2);

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 네비게이션 */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="font-bold text-xl text-blue-700">이자세이버</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">{user.email}</span>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="text-sm text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">내 대시보드</h1>
            <p className="text-slate-500 text-sm mt-1">오늘도 이자 아껴가세요 💪</p>
          </div>
          <Link
            href="/onboarding"
            className="text-sm text-blue-600 hover:text-blue-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            대출 정보 수정
          </Link>
        </div>

        {/* 내 대출 정보 요약 카드 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white shadow-lg shadow-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-200 text-sm font-medium">{loan.bank} · {loan.loan_type}</p>
              <p className="text-xs text-blue-300 mt-0.5">{loan.region} · {loan.property_type}</p>
            </div>
            <div className="bg-white/20 rounded-xl px-3 py-1">
              <span className="text-white text-xs font-bold">내 대출</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div>
              <p className="text-blue-200 text-xs mb-1">대출 잔액</p>
              <p className="text-xl sm:text-2xl font-black">{loanAmountEok}억</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs mb-1">현재 금리</p>
              <p className="text-xl sm:text-2xl font-black">{loan.current_rate}%</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs mb-1">월 납입액</p>
              <p className="text-xl sm:text-2xl font-black">
                {monthlyPayment >= 10000
                  ? `${Math.round(monthlyPayment / 10000)}만원`
                  : `${monthlyPayment.toLocaleString()}원`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 특판 목록 (왼쪽 2/3) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <span>🏦</span> 현재 특판 목록
              </h2>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                {offers?.length ?? 0}개 진행 중
              </span>
            </div>

            {offers && offers.length > 0 ? (
              offers.map((offer) => {
                const rateDiff = loan.current_rate - offer.rate;
                const isGood = rateDiff > 0;
                const monthlySaving = isGood
                  ? Math.round((loan.loan_amount * (rateDiff / 100)) / 12)
                  : 0;
                const daysLeft = getDaysLeft(offer.end_date);
                const colorClass =
                  BANK_COLORS[offer.bank] ?? "bg-slate-50 text-slate-700 border-slate-200";

                return (
                  <div
                    key={offer.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold px-3 py-1 rounded-full border ${colorClass}`}>
                          {offer.bank}
                        </span>
                        {daysLeft <= 7 && daysLeft > 0 && (
                          <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                            D-{daysLeft}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">{offer.rate}%</div>
                        {isGood && (
                          <div className="text-xs text-green-600 font-semibold">
                            -{rateDiff.toFixed(2)}%p
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">{offer.conditions}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {offer.start_date} ~ {offer.end_date}
                      </span>
                      {isGood ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-green-50 text-green-700 font-bold px-2 py-1 rounded-lg border border-green-200">
                            ✓ 내게 유리
                          </span>
                          <span className="text-sm font-black text-green-600">
                            월 {monthlySaving.toLocaleString()}원 절감
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                          현재 금리보다 높음
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-slate-500">현재 진행 중인 특판이 없어요</p>
                <p className="text-slate-400 text-sm mt-1">새 특판이 등록되면 알림으로 알려드릴게요</p>
              </div>
            )}

            {/* 더 많은 특판 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="font-bold text-blue-800 text-sm">더 많은 특판과 실시간 알림</p>
                <p className="text-blue-600 text-xs mt-0.5">프리미엄으로 업그레이드하면 카톡 알림을 받아요</p>
              </div>
              <Link
                href="/pricing"
                className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                업그레이드 →
              </Link>
            </div>
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="space-y-5">
            {/* 이자 절감 계산기 */}
            <SavingsCalculator loanInfo={loanInfo} />

            {/* 알림 설정 */}
            <AlertToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
