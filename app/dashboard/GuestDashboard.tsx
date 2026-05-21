"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SavingsCalculator from "./SavingsCalculator";
import DsrLtvCard from "./DsrLtvCard";
import { calcMonthlyPayment, calcRemainingBalance, type LoanInfo, type RepaymentType, type HomeCount } from "@/lib/loanCalc";

const DUMMY_OFFERS = [
  { id: "1", bank: "KB국민은행", rate: 3.45, conditions: "아파트담보대출, LTV 60% 이하, 서울/경기, 신규 고객", start_date: "2026-05-01", end_date: "2026-05-31" },
  { id: "2", bank: "신한은행", rate: 3.52, conditions: "주택담보대출, LTV 70% 이하, 전국, 급여이체 고객", start_date: "2026-05-10", end_date: "2026-06-10" },
  { id: "3", bank: "카카오뱅크", rate: 3.38, conditions: "아파트담보대출, LTV 50% 이하, 전국, 비대면 신청", start_date: "2026-05-15", end_date: "2026-05-30" },
  { id: "4", bank: "우리은행", rate: 3.61, conditions: "주택담보대출, LTV 70% 이하, 수도권, 신규 고객", start_date: "2026-05-01", end_date: "2026-05-25" },
  { id: "5", bank: "토스뱅크", rate: 3.29, conditions: "아파트담보대출, LTV 40% 이하, 전국, 비대면 전용", start_date: "2026-05-20", end_date: "2026-06-05" },
];

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

interface LoanData {
  loan_amount: number;
  current_rate: number;
  bank: string;
  loan_type: string;
  region: string;
  property_type: string;
  repayment_type?: RepaymentType;
  loan_start_date?: string;
  loan_term_years?: number;
  early_repayment_fee_rate?: number;
  early_repayment_fee_months?: number;
  property_value?: number;
  annual_income?: number;
  home_count?: number;
}

export default function GuestDashboard() {
  const router = useRouter();
  const [loan, setLoan] = useState<LoanData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("guest_loan");
    if (!stored) {
      router.push("/onboarding");
      return;
    }
    setLoan(JSON.parse(stored));
  }, [router]);

  if (!loan) return null;

  const loanInfo: LoanInfo = {
    originalAmount: loan.loan_amount,
    annualRate: loan.current_rate,
    repaymentType: loan.repayment_type ?? "원리금균등",
    loanStartDate: loan.loan_start_date ?? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    loanTermYears: loan.loan_term_years ?? 30,
    earlyRepaymentFeeRate: loan.early_repayment_fee_rate ?? 1.2,
    earlyRepaymentFeeMonths: loan.early_repayment_fee_months ?? 36,
  };

  const monthlyPayment = Math.round(calcMonthlyPayment(loanInfo));
  const remainingBalance = calcRemainingBalance(loanInfo);
  const loanAmountEok = (remainingBalance / 100000000).toFixed(2);
  const propertyValue = loan.property_value ?? 0;
  const annualIncome = loan.annual_income ?? 0;
  const homeCount = (loan.home_count ?? 0) as HomeCount;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 네비게이션 */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="font-bold text-xl text-blue-700">이자세이버</span>
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            저장하려면 가입하기
          </Link>
        </div>
      </nav>

      {/* 게스트 배너 */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center">
        <p className="text-amber-800 text-sm">
          지금은 체험 중이에요. 알림 받으려면{" "}
          <Link href="/signup" className="font-bold underline hover:text-amber-900">
            무료 가입
          </Link>
          하세요.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">내 대시보드</h1>
            <p className="text-slate-500 text-sm mt-1">특판과 절감액을 확인해보세요 💪</p>
          </div>
          <Link href="/onboarding" className="text-sm text-blue-600 hover:text-blue-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            대출 정보 수정
          </Link>
        </div>

        {/* 내 대출 요약 */}
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
          {/* 특판 목록 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <span>🏦</span> 현재 특판 목록
              </h2>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                {DUMMY_OFFERS.length}개 진행 중
              </span>
            </div>

            {DUMMY_OFFERS.map((offer) => {
              const rateDiff = loan.current_rate - offer.rate;
              const isGood = rateDiff > 0;
              const monthlySaving = isGood
                ? Math.round((loan.loan_amount * (rateDiff / 100)) / 12)
                : 0;
              const colorClass = BANK_COLORS[offer.bank] ?? "bg-slate-50 text-slate-700 border-slate-200";

              return (
                <div key={offer.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full border ${colorClass}`}>
                      {offer.bank}
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900">{offer.rate}%</div>
                      {isGood && (
                        <div className="text-xs text-green-600 font-semibold">-{rateDiff.toFixed(2)}%p</div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">{offer.conditions}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{offer.start_date} ~ {offer.end_date}</span>
                    {isGood ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-50 text-green-700 font-bold px-2 py-1 rounded-lg border border-green-200">✓ 내게 유리</span>
                        <span className="text-sm font-black text-green-600">월 {monthlySaving.toLocaleString()}원 절감</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">현재 금리보다 높음</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 알림 유도 배너 */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="font-bold text-blue-800 text-sm">새 특판 알림 받기</p>
                <p className="text-blue-600 text-xs mt-0.5">가입하면 특판 나올 때 바로 알려드려요</p>
              </div>
              <Link href="/signup" className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap">
                무료 가입 →
              </Link>
            </div>
          </div>

          {/* 계산기 + DSR/LTV */}
          <div className="space-y-5">
            <SavingsCalculator loanInfo={loanInfo} />
            <DsrLtvCard
              loanInfo={loanInfo}
              propertyValue={propertyValue}
              annualIncome={annualIncome}
              homeCount={homeCount}
              bank={loan.bank}
              region={loan.region}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
