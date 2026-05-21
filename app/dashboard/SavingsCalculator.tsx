"use client";

import { useState } from "react";
import { calcSavings, calcMonthlyPayment, calcBreakEvenRate, calcRemainingBalance, type LoanInfo } from "@/lib/loanCalc";

interface Props {
  loanInfo: LoanInfo;
}

export default function SavingsCalculator({ loanInfo }: Props) {
  const [newRate, setNewRate] = useState("");

  const newRateNum = parseFloat(newRate);
  const hasResult = newRate && !isNaN(newRateNum) && newRateNum > 0 && newRateNum < loanInfo.annualRate;

  const currentMonthly = Math.round(calcMonthlyPayment(loanInfo));
  const remainingBalance = calcRemainingBalance(loanInfo);
  const breakEvenRate = calcBreakEvenRate(loanInfo);
  const result = hasResult ? calcSavings(loanInfo, newRateNum) : null;

  const fiveYearMonths = result ? Math.min(60, result.remainingMonths) : 0;
  const fiveYearGross = result ? Math.round(result.monthlySaving * fiveYearMonths) : 0;
  const fiveYearNet = result ? fiveYearGross - result.fee : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2">
        <span className="text-xl">🧮</span> 이자 절감 계산기
      </h2>

      {/* 현재 정보 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-1">현재 월 납입액</div>
          <div className="font-black text-slate-900 text-sm">{currentMonthly.toLocaleString()}원</div>
          <div className="text-xs text-slate-400 mt-0.5">{loanInfo.repaymentType}</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-1">현재 금리</div>
          <div className="font-black text-slate-900">{loanInfo.annualRate}%</div>
          <div className="text-xs text-slate-400 mt-0.5">잔여 {result?.remainingMonths ?? 0}개월</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-1">현재 잔여 잔액</div>
          <div className="font-black text-slate-900 text-sm">{(remainingBalance / 10000).toFixed(0)}만원</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-1">손익분기 금리</div>
          {breakEvenRate !== null ? (
            <>
              <div className="font-black text-blue-700 text-sm">{breakEvenRate}% 이하</div>
              <div className="text-xs text-slate-400 mt-0.5">수수료 내고도 이득</div>
            </>
          ) : (
            <>
              <div className="font-black text-green-700 text-sm">제한 없음</div>
              <div className="text-xs text-slate-400 mt-0.5">낮을수록 무조건 이득</div>
            </>
          )}
        </div>
      </div>

      {/* 중도상환수수료 상태 */}
      {(() => {
        if (loanInfo.earlyRepaymentFeeMonths === 0) return null;
        const { isExpired, remainingFeeMonths, fee } = calcSavings(loanInfo, loanInfo.annualRate - 0.001);
        return isExpired ? (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span className="text-sm text-green-700 font-semibold">중도상환수수료 면제 기간 종료 — 수수료 없이 갈아탈 수 있어요</span>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-700 font-semibold">중도상환수수료 잔여 {remainingFeeMonths}개월</span>
              <span className="text-sm font-black text-amber-700">약 {Math.round(fee).toLocaleString()}원</span>
            </div>
            <p className="text-xs text-amber-600 mt-0.5">수수료 기간: 대출 실행 후 {loanInfo.earlyRepaymentFeeMonths}개월</p>
          </div>
        );
      })()}

      {/* 특판 금리 입력 */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          비교할 특판 금리 입력
        </label>
        <div className="relative">
          <input
            type="number" value={newRate}
            onChange={(e) => setNewRate(e.target.value)}
            placeholder={`현재 ${loanInfo.annualRate}% 보다 낮게`}
            min="1" max={loanInfo.annualRate - 0.01} step="0.01"
            className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
        </div>
      </div>

      {/* 결과 */}
      {result ? (
        <div className="space-y-3">
          {/* 핵심 수치 */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">매달 덜 내는 금액</span>
              <span className="font-black text-green-700 text-lg">↓ {Math.round(result.monthlySaving).toLocaleString()}원</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">1년 절약액</span>
              <span className="font-black text-green-700 text-xl">{Math.round(result.yearlySaving).toLocaleString()}원</span>
            </div>
            <div className="border-t border-green-200 pt-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-green-700">5년 절약액</span>
                {result.fee > 0 && <span className="text-xs text-green-600 ml-1">(수수료 차감 후)</span>}
              </div>
              <span className="font-black text-green-700 text-xl">{fiveYearNet.toLocaleString()}원</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">남은 기간 전체 절약액</span>
              <span className="font-bold text-green-600">{Math.round(result.netTotalSaving).toLocaleString()}원</span>
            </div>
          </div>

          {/* 수수료 & 손익분기 */}
          {result.fee > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-700">중도상환수수료</span>
                <span className="font-bold text-amber-700">-{Math.round(result.fee).toLocaleString()}원</span>
              </div>
              {result.breakEvenMonths > 0 && (
                <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                  <span className="text-sm font-semibold text-amber-800">갈아탄 후 순이익 시작</span>
                  <span className="font-black text-amber-700 text-lg">{result.breakEvenMonths}개월 후</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : newRate && !hasResult ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-sm text-amber-700">
          현재 금리({loanInfo.annualRate}%)보다 낮은 금리를 입력해야 절감 효과가 있어요
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl p-4 text-center text-sm text-slate-400">
          위에서 특판 금리를 입력하면 정확한 절감액이 계산돼요
        </div>
      )}
    </div>
  );
}
