"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SavingsCalculator from "./SavingsCalculator";
import DsrLtvCard from "./DsrLtvCard";
import BankOfferCard from "./BankOfferCard";
import { calcMonthlyPayment, calcRemainingBalance, type LoanInfo, type RepaymentType, type HomeCount } from "@/lib/loanCalc";
import type { BankOffer } from "@/lib/finlife";

function getEndDateInfo(endDate: string | null): { label: string; daysLeft: number; isSpecial: boolean } | null {
  if (!endDate) return null;
  const end = new Date(`${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return null;
  const label = `${endDate.slice(4, 6)}/${endDate.slice(6, 8)}까지`;
  return { label, daysLeft, isSpecial: daysLeft <= 90 };
}

const BANK_URLS: Record<string, string> = {
  KB국민은행: "https://obank.kbstar.com/qub/site/mul/template/depositLoan.jsp",
  신한은행: "https://www.shinhan.com/hpe/index.jsp#home/loan/mortgageLoan/mortgageLoanIntro.do",
  우리은행: "https://www.wooribank.com/wb/wob/loan/comDpLo0003.do?menuCode=0094",
  하나은행: "https://www.kebhana.com/cont/mall/mall08/mall0801/index.jsp",
  NH농협은행: "https://banking.nonghyup.com/nhbank.html",
  IBK기업은행: "https://www.ibk.co.kr/mortgage",
  "SC제일은행": "https://www.sc.co.kr/html/ko/mortgage/mortgage_0201000000.html",
  카카오뱅크: "https://www.kakaobank.com/products/mortgage-loan",
  토스뱅크: "https://www.tossbank.com/product/loan",
  K뱅크: "https://www.kbanknow.com/ib20/mnu/FPMLON010000000",
  부산은행: "https://www.busanbank.co.kr/ib20/mnu/FPMLON010000",
  경남은행: "https://www.knbank.co.kr/ib20/mnu/FPMLON010000",
  "대구은행(iM뱅크)": "https://www.imbank.co.kr/ib20/mnu/FPMLON010000",
  광주은행: "https://www.kjbank.com/ib20/mnu/FPMLON010000",
  전북은행: "https://www.jbbank.co.kr/ib20/mnu/FPMLON010000",
  제주은행: "https://www.jejubank.co.kr/ib20/mnu/FPMLON010000",
  수협은행: "https://www.suhyup-bank.com/ib20/mnu/FPMLON010000",
  SBI저축은행: "https://www.sbibank.co.kr/loan/mortgage.do",
  OK저축은행: "https://www.oksavingsbank.com/loan/mortgage.do",
  웰컴저축은행: "https://www.welcomebank.co.kr/loan/mortgage.do",
  페퍼저축은행: "https://www.pepperbank.co.kr/loan/mortgage.do",
  애큐온저축은행: "https://www.aquon.co.kr/loan/mortgage.do",
  다올저축은행: "https://www.daolsb.com/loan/mortgage.do",
};

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
  const [offers, setOffers] = useState<BankOffer[]>([]);
  const [disclosedAt, setDisclosedAt] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("guest_loan");
    if (!stored) {
      router.push("/onboarding");
      return;
    }
    setLoan(JSON.parse(stored));
    const parsed = JSON.parse(stored);
    const pt = encodeURIComponent(parsed.property_type ?? "");
    const rt = encodeURIComponent(parsed.repayment_type ?? "");
    fetch(`/api/finlife?property_type=${pt}&repayment_type=${rt}`).then(r => r.json()).then(d => {
      setOffers(d.banks ?? []);
      if (d.disclosedAt) setDisclosedAt(d.disclosedAt);
    });
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
                <span>🏦</span> 은행별 주담대 금리
              </h2>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                {offers.length > 0
                  ? `금감원 · ${loan.property_type} · ${loan.repayment_type ?? ""} · ${offers.length}개 은행${disclosedAt ? ` · 공시일 ${disclosedAt}` : ""}`
                  : "불러오는 중..."}
              </span>
            </div>

            {offers.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                <p className="text-3xl mb-3">⏳</p>
                <p className="text-slate-400 text-sm">금리 정보를 불러오는 중이에요</p>
              </div>
            )}

            {offers.map((offer) => (
              <BankOfferCard
                key={offer.bankName}
                offer={offer}
                currentRate={loan.current_rate}
                loanAmount={loan.loan_amount}
                loanInfo={loanInfo}
              />
            ))}

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
