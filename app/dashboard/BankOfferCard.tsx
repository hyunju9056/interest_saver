"use client";

import { useState } from "react";
import type { BankOffer } from "@/lib/finlife";
import { calcSavings, calcEarlyRepaymentFee, type LoanInfo } from "@/lib/loanCalc";

const BANK_URLS: Record<string, string> = {
  KB국민은행: "https://www.kbstar.com",
  신한은행: "https://www.shinhan.com",
  우리은행: "https://www.wooribank.com",
  하나은행: "https://www.kebhana.com",
  NH농협은행: "https://www.nonghyup.com",
  "농협은행주식회사": "https://www.nonghyup.com",
  IBK기업은행: "https://www.ibk.co.kr",
  "SC제일은행": "https://www.sc.co.kr",
  카카오뱅크: "https://www.kakaobank.com",
  토스뱅크: "https://www.tossbank.com",
  K뱅크: "https://www.kbanknow.com",
  부산은행: "https://www.busanbank.co.kr",
  경남은행: "https://www.knbank.co.kr",
  "대구은행(iM뱅크)": "https://www.imbank.co.kr",
  아이엠뱅크: "https://www.imbank.co.kr",
  광주은행: "https://www.kjbank.com",
  전북은행: "https://www.jbbank.co.kr",
  제주은행: "https://www.jejubank.co.kr",
  수협은행: "https://www.suhyup-bank.com",
  SBI저축은행: "https://www.sbibank.co.kr",
  OK저축은행: "https://www.oksavingsbank.com",
  웰컴저축은행: "https://www.welcomebank.co.kr",
  페퍼저축은행: "https://www.pepperbank.co.kr",
  애큐온저축은행: "https://www.aquon.co.kr",
  다올저축은행: "https://www.daolsb.com",
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

function calcIncidentalCosts(loanAmount: number) {
  let ingise = 0;
  if (loanAmount >= 50_000_000 && loanAmount < 100_000_000) ingise = 35_000;
  else if (loanAmount >= 100_000_000 && loanAmount < 1_000_000_000) ingise = 75_000;
  else if (loanAmount >= 1_000_000_000) ingise = 175_000;

  const bondFace = Math.round(loanAmount * 1.2 * 0.01);
  const bondCost = Math.round(bondFace * 0.03);

  return { ingise, bondFace, bondCost, total: ingise + bondCost };
}

function getEndDateInfo(endDate: string | null) {
  if (!endDate) return null;
  const end = new Date(`${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return null;
  const label = `${endDate.slice(4, 6)}/${endDate.slice(6, 8)}까지`;
  return { label, daysLeft, isSpecial: daysLeft <= 90 };
}

function parseSpclConditions(spclRate: string | null): Array<{ label: string; rate: number }> {
  if (!spclRate) return [];
  const rateRe = /([\d]+(?:\.[\d]+)?)\s*%\s*[pP]?(?=[^0-9]|$)/gi;
  return spclRate
    .split("\n")
    .map(l => l.trim())
    .filter(l => l && !/최대|최고|합계|가산/.test(l))
    .flatMap(line => {
      const hits = [...line.matchAll(rateRe)].filter(m => {
        const r = parseFloat(m[1]);
        return r > 0 && r < 5;
      });
      if (hits.length === 0) return [];
      if (hits.length === 1) return [{ label: line, rate: parseFloat(hits[0][1]) }];
      return hits.map((m, i) => {
        const segStart = i === 0 ? 0 : hits[i - 1].index! + hits[i - 1][0].length;
        const seg = line.slice(segStart, m.index! + m[0].length).trim().replace(/^[\s,·\/\-–—]+/, "").trim();
        return { label: seg || line, rate: parseFloat(m[1]) };
      });
    });
}

interface Props {
  offer: BankOffer;
  currentRate: number;
  loanAmount: number;
  loanInfo: LoanInfo;
}

export default function BankOfferCard({ offer, currentRate, loanAmount, loanInfo }: Props) {
  const [expanded, setExpanded] = useState(false);

  const maxSpclAvailable = parseFloat((offer.maxRate - offer.minRate).toFixed(2));
  const conditions = parseSpclConditions(offer.spclRate);
  const [checkedSet, setCheckedSet] = useState<Set<number>>(() => new Set(conditions.map((_, i) => i)));
  const [spclInput, setSpclInput] = useState(String(maxSpclAvailable));

  const totalParsed = conditions.reduce((s, c) => s + c.rate, 0);
  const checkedTotal = conditions.reduce((s, c, i) => checkedSet.has(i) ? s + c.rate : s, 0);
  // 전체 체크 시 minRate 보장: 파싱된 합계가 maxSpclAvailable보다 적어도 비율로 보정
  const appliedSpcl = conditions.length > 0 && totalParsed > 0
    ? parseFloat((maxSpclAvailable * (checkedTotal / totalParsed)).toFixed(2))
    : (() => { const p = parseFloat(spclInput); return isNaN(p) ? maxSpclAvailable : Math.min(Math.max(p, 0), maxSpclAvailable); })();

  const effectiveRate = parseFloat((offer.maxRate - appliedSpcl).toFixed(2));

  const toggleCondition = (i: number) => setCheckedSet(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });

  const rateDiff = currentRate - effectiveRate;
  const isGood = rateDiff > 0;
  const savings = isGood ? calcSavings(loanInfo, effectiveRate) : null;
  const monthlySaving = savings ? Math.round(savings.monthlySaving) : 0;
  const colorClass = BANK_COLORS[offer.bankName] ?? "bg-slate-50 text-slate-700 border-slate-200";
  const endInfo = getEndDateInfo(offer.endDate);

  return (
    <div
      className={`bg-white rounded-2xl border p-5 transition-all cursor-pointer select-none ${
        expanded ? "border-blue-300 shadow-md" : "border-slate-200 hover:border-blue-200 hover:shadow-md"
      }`}
      onClick={() => setExpanded((v) => !v)}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-bold px-3 py-1 rounded-full border ${colorClass}`}>
            {offer.bankName}
          </span>
          {endInfo?.isSpecial && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              endInfo.daysLeft <= 14
                ? "bg-red-100 text-red-600 border border-red-200"
                : "bg-orange-100 text-orange-600 border border-orange-200"
            }`}>
              🔥 특판 · {endInfo.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-2xl font-black text-slate-900">{effectiveRate}%</div>
            <div className="text-xs text-slate-400 mt-0.5">
              기준 <span className="font-semibold">{offer.maxRate}%</span>
              {appliedSpcl > 0 && (
                <span className="text-blue-500 font-semibold ml-1">
                  — 우대 {appliedSpcl.toFixed(2)}%p
                </span>
              )}
            </div>
            {isGood && (
              <div className="text-xs text-green-600 font-semibold mt-0.5">내 금리 대비 -{rateDiff.toFixed(2)}%p</div>
            )}
          </div>
          <span className="text-slate-300 text-lg">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* 상품명 */}
      <p className="text-xs text-slate-500 mb-3 leading-relaxed">
        {offer.products.slice(0, 3).join(" · ")}
      </p>

      {/* 절감액 */}
      <div className="flex items-center justify-between">
        {isGood ? (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-50 text-green-700 font-bold px-2 py-1 rounded-lg border border-green-200">✓ 내게 유리</span>
            <span className="text-sm font-black text-green-600">월 {monthlySaving.toLocaleString()}원 절감</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">현재 금리보다 높음</span>
        )}
        <span className="text-xs text-slate-400">상세 보기</span>
      </div>

      {/* 펼쳐지는 상세 */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 select-text" onClick={(e) => e.stopPropagation()}>

          {/* 우대금리 조건 — 체크박스 or 텍스트 */}
          {maxSpclAvailable > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs font-bold text-green-700 mb-2">
                우대금리 조건{conditions.length > 0 ? " — 해당 항목만 체크" : ""}
              </p>
              {conditions.length > 0 ? (
                <>
                  <div className="space-y-1.5">
                    {conditions.map((c, i) => (
                      <label key={i} className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checkedSet.has(i)}
                          onChange={() => toggleCondition(i)}
                          className="mt-0.5 accent-green-600 w-4 h-4 shrink-0"
                        />
                        <span className={`text-sm leading-snug ${checkedSet.has(i) ? "text-green-800" : "text-slate-400 line-through"}`}>
                          {c.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-green-200">
                    <span className="text-xs text-green-700 font-semibold">내 적용 우대금리</span>
                    <span className="text-sm font-black text-green-800">-{appliedSpcl.toFixed(2)}%p → {effectiveRate}%</span>
                  </div>
                </>
              ) : (
                <>
                  {offer.spclRate && (
                    <p className="text-sm text-green-800 whitespace-pre-line leading-relaxed mb-2">{offer.spclRate}</p>
                  )}
                  <div className="flex items-center gap-2 pt-2 border-t border-green-200">
                    <span className="text-xs text-green-700 whitespace-nowrap">내가 받을 우대금리</span>
                    <div className="relative flex-1">
                      <input
                        type="number" value={spclInput}
                        onChange={(e) => setSpclInput(e.target.value)}
                        min="0" max={maxSpclAvailable} step="0.05"
                        className="w-full px-3 py-1 pr-8 rounded-lg border border-green-200 bg-white text-sm focus:outline-none focus:border-green-400"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-400">%p</span>
                    </div>
                    <span className="text-sm font-black text-green-800 whitespace-nowrap">→ {effectiveRate}%</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 갈아타기 비용 + 손익분기 */}
          {isGood && savings && (() => {
            const costs = calcIncidentalCosts(loanAmount);
            const { fee: repayFee, isExpired } = calcEarlyRepaymentFee(loanInfo);
            const totalCost = Math.round(costs.total + repayFee);
            const breakEvenMonths = monthlySaving > 0
              ? Math.ceil(totalCost / monthlySaving)
              : null;

            return (
              <div className="space-y-2">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-amber-700 mb-2">갈아타기 총 예상 비용</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-800">인지세 <span className="text-xs text-amber-600">(차주 50%)</span></span>
                      <span className="font-semibold text-amber-900">
                        {costs.ingise === 0 ? "면제" : `${(costs.ingise / 10000).toFixed(1)}만원`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-800">국민주택채권 즉시매도 <span className="text-xs text-amber-600">(할인율 3% 추정)</span></span>
                      <span className="font-semibold text-amber-900">약 {Math.round(costs.bondCost / 10000)}만원</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-800">중도상환수수료</span>
                      <span className="font-semibold text-amber-900">
                        {isExpired ? "면제" : `약 ${Math.round(repayFee / 10000)}만원`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-amber-200 pt-1.5 mt-0.5">
                      <span className="font-bold text-amber-800">총 예상 비용</span>
                      <span className="font-black text-amber-900">약 {Math.round(totalCost / 10000)}만원</span>
                    </div>
                  </div>
                  <p className="text-xs text-amber-500 mt-1.5">* 채권할인율 변동, 등기비용 별도</p>
                </div>

                {breakEvenMonths !== null && (
                  <div className={`rounded-xl p-3 text-center ${
                    breakEvenMonths <= 12
                      ? "bg-green-100 border border-green-300"
                      : "bg-blue-50 border border-blue-200"
                  }`}>
                    <p className={`text-xs font-bold mb-0.5 ${breakEvenMonths <= 12 ? "text-green-700" : "text-blue-700"}`}>
                      지금 갈아타면
                    </p>
                    <p className={`text-2xl font-black ${breakEvenMonths <= 12 ? "text-green-700" : "text-blue-700"}`}>
                      {breakEvenMonths}개월 후부터 이득
                    </p>
                    <p className={`text-xs mt-0.5 ${breakEvenMonths <= 12 ? "text-green-600" : "text-blue-500"}`}>
                      월 {monthlySaving.toLocaleString()}원 절감 기준
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {offer.joinWay && (
            <div>
              <p className="text-xs font-bold text-slate-500 mb-0.5">가입 방법</p>
              <p className="text-sm text-slate-700">{offer.joinWay}</p>
            </div>
          )}
          {offer.loanLmt && (
            <div>
              <p className="text-xs font-bold text-slate-500 mb-0.5">대출 한도</p>
              <p className="text-sm text-slate-700">{offer.loanLmt}</p>
            </div>
          )}
          {offer.erlyRpayFee && (
            <div>
              <p className="text-xs font-bold text-slate-500 mb-0.5">중도상환수수료</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{offer.erlyRpayFee}</p>
            </div>
          )}
          {BANK_URLS[offer.bankName] && (
            <a
              href={BANK_URLS[offer.bankName]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline"
            >
              🏦 {offer.bankName} (홈페이지) →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
