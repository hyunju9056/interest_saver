"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { calcMonthlyPayment, calcMonthlyInterest, calcRemainingBalance, calcLTV, calcDSR, ltvLimit, dsrLimit, type RepaymentType, type HomeCount } from "@/lib/loanCalc";

const BANK_GROUPS = [
  {
    label: "시중은행",
    banks: ["KB국민은행", "신한은행", "우리은행", "하나은행", "NH농협은행", "IBK기업은행", "SC제일은행"],
  },
  {
    label: "인터넷전문은행",
    banks: ["카카오뱅크", "토스뱅크", "K뱅크"],
  },
  {
    label: "지방은행",
    banks: ["부산은행", "경남은행", "대구은행(iM뱅크)", "광주은행", "전북은행", "제주은행", "수협은행"],
  },
  {
    label: "저축은행 (제2금융권)",
    banks: ["SBI저축은행", "OK저축은행", "웰컴저축은행", "페퍼저축은행", "애큐온저축은행", "다올저축은행"],
  },
];
const LOAN_TYPES = ["주택담보대출"];
const REGIONS = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "기타"];
const PROPERTY_TYPES = ["아파트", "빌라", "단독주택"];
const REPAYMENT_TYPES: { value: RepaymentType; label: string; desc: string }[] = [
  { value: "원리금균등", label: "원리금균등", desc: "매달 같은 금액 납입" },
  { value: "원금균등", label: "원금균등", desc: "매달 원금은 동일, 이자 감소" },
  { value: "만기일시", label: "만기일시", desc: "만기에 원금 일시 상환" },
];
const LOAN_TERMS = [10, 15, 20, 25, 30, 35, 40, 50];

function formatManwon(valueStr: string): string {
  const value = Math.floor(parseFloat(valueStr));
  if (isNaN(value) || value <= 0) return "";
  const eok = Math.floor(value / 10000);
  const man = value % 10000;
  const cheon = Math.floor(man / 1000);
  const baek = Math.floor((man % 1000) / 100);
  const rest = man % 100;
  let manStr = "";
  if (cheon > 0) manStr += `${cheon}천`;
  if (baek > 0) manStr += `${baek}백`;
  if (rest > 0) manStr += `${rest}`;
  if (eok > 0 && manStr) return `${eok}억 ${manStr}만원`;
  if (eok > 0) return `${eok}억원`;
  if (manStr) return `${manStr}만원`;
  return `${value}만원`;
}

export default function OnboardingPage() {
  const router = useRouter();

  const DRAFT_KEY = "onboarding_draft";

  const [form, setForm] = useState({
    loan_amount: "",
    current_rate: "",
    bank: "",
    loan_type: "주택담보대출",
    region: "",
    property_type: "",
    repayment_type: "" as RepaymentType | "",
    loan_start_date: "",
    loan_term_years: "",
    early_repayment_fee_rate: "1.2",
    early_repayment_fee_months: "36",
    property_value: "",
    annual_income: "",
    home_count: "0",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try { setForm(JSON.parse(saved)); } catch {}
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => {
      const next = { ...prev, [e.target.name]: e.target.value };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      return next;
    });
  }

  function handleAddAmount(field: "loan_amount" | "property_value" | "annual_income", add: number) {
    setForm((prev) => {
      const current = parseFloat(prev[field]) || 0;
      const next = { ...prev, [field]: String(current + add) };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      return next;
    });
  }

  const AMOUNT_BUTTONS = [
    { label: "+10만", value: 10 },
    { label: "+100만", value: 100 },
    { label: "+1000만", value: 1000 },
    { label: "+1억", value: 10000 },
  ];

  // 월 납입액 미리보기
  const previewPayment = (() => {
    if (!form.loan_amount || !form.current_rate || !form.repayment_type || !form.loan_start_date || !form.loan_term_years) return null;
    try {
      const info = {
        originalAmount: parseFloat(form.loan_amount) * 10000,
        annualRate: parseFloat(form.current_rate),
        repaymentType: form.repayment_type as RepaymentType,
        loanStartDate: form.loan_start_date,
        loanTermYears: parseInt(form.loan_term_years),
        earlyRepaymentFeeRate: parseFloat(form.early_repayment_fee_rate) || 0,
        earlyRepaymentFeeMonths: parseInt(form.early_repayment_fee_months) || 0,
      };
      const monthly = calcMonthlyPayment(info);
      const interest = calcMonthlyInterest(info);
      const remaining = calcRemainingBalance(info);
      const loanAmt = parseFloat(form.loan_amount) * 10000;
      const propVal = parseFloat(form.property_value) * 10000;
      const income = parseFloat(form.annual_income) * 10000;
      const hc = parseInt(form.home_count) as HomeCount;
      const ltv = propVal > 0 ? calcLTV(loanAmt, propVal) : null;
      const ltvMax = propVal > 0 ? ltvLimit(form.region || "기타", hc) : null;
      const dsr = income > 0 ? calcDSR(monthly, income) : null;
      const dsrMax = dsrLimit(form.bank || "");
      return {
        monthly: Math.round(monthly),
        interest: Math.round(interest),
        remaining: Math.round(remaining),
        ltv, ltvMax, dsr, dsrMax,
      };
    } catch {
      return null;
    }
  })();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const loanData = {
      loan_amount: parseFloat(form.loan_amount) * 10000,
      current_rate: parseFloat(form.current_rate),
      bank: form.bank,
      loan_type: form.loan_type,
      region: form.region,
      property_type: form.property_type,
      repayment_type: form.repayment_type,
      loan_start_date: form.loan_start_date,
      loan_term_years: parseInt(form.loan_term_years),
      early_repayment_fee_rate: parseFloat(form.early_repayment_fee_rate) || 0,
      early_repayment_fee_months: parseInt(form.early_repayment_fee_months) || 0,
      property_value: parseFloat(form.property_value) * 10000 || 0,
      annual_income: parseFloat(form.annual_income) * 10000 || 0,
      home_count: parseInt(form.home_count) || 0,
    };

    if (!user) {
      localStorage.setItem("guest_loan", JSON.stringify(loanData));
      router.push("/dashboard");
      return;
    }

    const { error } = await supabase.from("loans").upsert({
      user_id: user.id,
      ...loanData,
    });

    if (error) {
      setError("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  const isValid =
    form.loan_amount && form.current_rate && form.bank && form.loan_type &&
    form.region && form.property_type && form.repayment_type &&
    form.loan_start_date && form.loan_term_years;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <nav className="p-4 sm:p-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span className="font-bold text-xl text-blue-700">이자세이버</span>
        </Link>
        <span className="text-sm text-slate-500">정보 입력 → 대시보드</span>
      </nav>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
              <span className="text-3xl">🏠</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">대출 정보를 입력해주세요</h1>
            <p className="text-slate-500">정확할수록 절감액 계산이 정확해져요</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ① 대출 원금 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">대출 원금 <span className="font-normal text-slate-400">(처음 빌린 금액)</span></label>
                <div className="relative">
                  <input
                    type="number" name="loan_amount" value={form.loan_amount}
                    onChange={handleChange} placeholder="예: 20000" min="100" max="999999" required
                    className="w-full px-4 py-3 pr-16 rounded-xl border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">만원</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {AMOUNT_BUTTONS.map((btn) => (
                    <button key={btn.value} type="button"
                      onClick={() => handleAddAmount("loan_amount", btn.value)}
                      className="flex-1 text-xs py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >{btn.label}</button>
                  ))}
                </div>
                {form.loan_amount && (
                  <p className="text-xs text-blue-600 mt-1 font-medium">= {formatManwon(form.loan_amount)}</p>
                )}
              </div>

              {/* ② 현재 금리 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">현재 적용 금리</label>
                <div className="relative">
                  <input
                    type="number" name="current_rate" value={form.current_rate}
                    onChange={handleChange} placeholder="예: 4.50" min="1" max="15" step="0.01" required
                    className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">%</span>
                </div>
              </div>

              {/* ③ 상환 방식 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">상환 방식</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {REPAYMENT_TYPES.map((rt) => (
                    <button
                      key={rt.value} type="button"
                      onClick={() => setForm((p) => { const next = { ...p, repayment_type: rt.value }; localStorage.setItem(DRAFT_KEY, JSON.stringify(next)); return next; })}
                      className={`py-3 px-3 rounded-xl border-2 text-left sm:text-center transition-all flex sm:block items-center gap-3 ${
                        form.repayment_type === rt.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className={`text-sm font-bold ${form.repayment_type === rt.value ? "text-blue-700" : "text-slate-700"}`}>{rt.label}</div>
                      <div className="text-xs text-slate-400 sm:mt-0.5 leading-tight">{rt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ④ 대출 실행일 + 대출 기간 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">대출 실행일</label>
                  <input
                    type="date" name="loan_start_date" value={form.loan_start_date}
                    onChange={handleChange} required
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-blue-400 transition-colors bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">대출 기간</label>
                  <select
                    name="loan_term_years" value={form.loan_term_years}
                    onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-blue-400 transition-colors bg-white"
                  >
                    <option value="">선택</option>
                    {LOAN_TERMS.map((y) => (
                      <option key={y} value={y}>{y}년</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ⑤ 중도상환수수료 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">중도상환수수료</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1.5">수수료율</p>
                    <div className="relative">
                      <input
                        type="number" name="early_repayment_fee_rate"
                        value={form.early_repayment_fee_rate}
                        onChange={handleChange} min="0" max="5" step="0.1"
                        className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-blue-400 transition-colors"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1.5">면제까지 기간</p>
                    <div className="relative">
                      <input
                        type="number" name="early_repayment_fee_months"
                        value={form.early_repayment_fee_months}
                        onChange={handleChange} min="0" max="60" step="1"
                        className="w-full px-4 py-3 pr-16 rounded-xl border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-blue-400 transition-colors"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">개월</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">대부분 은행: 수수료율 1.2%, 면제 기간 36개월</p>
              </div>

              {/* ⑥ DSR / LTV 체크 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  DSR · LTV 체크 <span className="font-normal text-slate-400 text-xs">(선택)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1.5">담보물건 가격</p>
                    <div className="relative">
                      <input
                        type="number" name="property_value" value={form.property_value}
                        onChange={handleChange} min="100" placeholder="예: 50000"
                        className="w-full px-4 py-3 pr-16 rounded-xl border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">만원</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {AMOUNT_BUTTONS.map((btn) => (
                        <button key={btn.value} type="button"
                          onClick={() => handleAddAmount("property_value", btn.value)}
                          className="flex-1 text-xs py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >{btn.label}</button>
                      ))}
                    </div>
                    {form.property_value && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">= {formatManwon(form.property_value)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1.5">연소득</p>
                    <div className="relative">
                      <input
                        type="number" name="annual_income" value={form.annual_income}
                        onChange={handleChange} min="100" placeholder="예: 6000"
                        className="w-full px-4 py-3 pr-16 rounded-xl border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">만원</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {AMOUNT_BUTTONS.map((btn) => (
                        <button key={btn.value} type="button"
                          onClick={() => handleAddAmount("annual_income", btn.value)}
                          className="flex-1 text-xs py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >{btn.label}</button>
                      ))}
                    </div>
                    {form.annual_income && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">= {formatManwon(form.annual_income)}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-1.5">주택 보유 수</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([["0", "무주택"], ["1", "1주택"], ["2", "2주택+"]] as const).map(([val, label]) => (
                      <button key={val} type="button"
                        onClick={() => setForm((p) => { const next = { ...p, home_count: val }; localStorage.setItem(DRAFT_KEY, JSON.stringify(next)); return next; })}
                        className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                          form.home_count === val ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >{label}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ⑦ 대출 은행 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">대출 은행</label>
                <select name="bank" value={form.bank} onChange={handleChange} required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-blue-400 transition-colors bg-white"
                >
                  <option value="">은행 선택</option>
                  {BANK_GROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.banks.map((b) => <option key={b} value={b}>{b}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* ⑦ 대출 종류 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">대출 종류</label>
                <div className="flex items-center gap-3">
                  <div className="py-3 px-4 rounded-xl border-2 border-blue-500 bg-blue-50 text-blue-700 text-sm font-semibold">
                    주택담보대출
                  </div>
                  <span className="text-xs text-slate-400">전세자금·신용·기타 준비중</span>
                </div>
              </div>

              {/* ⑧ 지역 + 담보 유형 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">지역</label>
                  <select name="region" value={form.region} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-blue-400 transition-colors bg-white"
                  >
                    <option value="">선택</option>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">담보 유형</label>
                  <select name="property_type" value={form.property_type} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-blue-400 transition-colors bg-white"
                  >
                    <option value="">선택</option>
                    {PROPERTY_TYPES.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
                  </select>
                </div>
              </div>

              {/* 미리보기 */}
              {previewPayment && (
                <div className="space-y-3">
                  {/* 납입액 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">현재 잔여 잔액</span>
                      <span className="font-black text-blue-700 text-lg">{(previewPayment.remaining / 10000).toFixed(0)}만원</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">월 납입액 ({form.repayment_type})</span>
                      <span className="font-black text-blue-700 text-lg">{previewPayment.monthly.toLocaleString()}원</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-500">그 중 이자</span>
                      <span className="font-semibold text-blue-500 text-sm">{previewPayment.interest.toLocaleString()}원</span>
                    </div>
                  </div>

                  {/* LTV / DSR */}
                  {(previewPayment.ltv !== null || previewPayment.dsr !== null) && (
                    <div className="grid grid-cols-2 gap-3">
                      {previewPayment.ltv !== null && previewPayment.ltvMax !== null && (() => {
                        const over = previewPayment.ltv > previewPayment.ltvMax;
                        return (
                          <div className={`rounded-xl border-2 px-4 py-3 ${over ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                            <div className="text-xs text-slate-500 mb-1">LTV</div>
                            <div className={`font-black text-xl ${over ? "text-red-600" : "text-green-700"}`}>{previewPayment.ltv}%</div>
                            <div className={`text-xs mt-0.5 ${over ? "text-red-500" : "text-green-600"}`}>
                              한도 {previewPayment.ltvMax}% {over ? "⚠ 초과" : "✓ 이내"}
                            </div>
                          </div>
                        );
                      })()}
                      {previewPayment.dsr !== null && (() => {
                        const over = previewPayment.dsr > previewPayment.dsrMax;
                        return (
                          <div className={`rounded-xl border-2 px-4 py-3 ${over ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                            <div className="text-xs text-slate-500 mb-1">DSR</div>
                            <div className={`font-black text-xl ${over ? "text-red-600" : "text-green-700"}`}>{previewPayment.dsr}%</div>
                            <div className={`text-xs mt-0.5 ${over ? "text-red-500" : "text-green-600"}`}>
                              한도 {previewPayment.dsrMax}% {over ? "⚠ 초과" : "✓ 이내"}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
              )}

              <button
                type="submit" disabled={!isValid || loading}
                className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] shadow-lg shadow-blue-200"
              >
                {loading ? "저장 중..." : "이자 절감 계산하기 →"}
              </button>

              <p className="text-xs text-center text-slate-400">입력하신 정보는 암호화되어 안전하게 저장됩니다</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
