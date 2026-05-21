"use client";

import { calcLTV, calcDSR, ltvLimit, dsrLimit, calcMonthlyPayment, type LoanInfo, type HomeCount } from "@/lib/loanCalc";

interface Props {
  loanInfo: LoanInfo;
  propertyValue: number;
  annualIncome: number;
  homeCount: HomeCount;
  bank: string;
  region: string;
}

export default function DsrLtvCard({ loanInfo, propertyValue, annualIncome, homeCount, bank, region }: Props) {
  const hasLtv = propertyValue > 0;
  const hasDsr = annualIncome > 0;
  if (!hasLtv && !hasDsr) return null;

  const monthly = calcMonthlyPayment(loanInfo);
  const ltv = hasLtv ? calcLTV(loanInfo.originalAmount, propertyValue) : null;
  const ltvMax = hasLtv ? ltvLimit(region, homeCount) : null;
  const dsr = hasDsr ? calcDSR(monthly, annualIncome) : null;
  const dsrMax = dsrLimit(bank);

  const ltvOver = ltv !== null && ltvMax !== null && ltv > ltvMax;
  const dsrOver = dsr !== null && dsr > dsrMax;
  const anyOver = ltvOver || dsrOver;

  return (
    <div className={`rounded-2xl border p-5 ${anyOver ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}>
      <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
        <span>📊</span> DSR · LTV 현황
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {ltv !== null && ltvMax !== null && (
          <div className={`rounded-xl border-2 px-4 py-3 ${ltvOver ? "bg-red-50 border-red-300" : "bg-green-50 border-green-200"}`}>
            <div className="text-xs text-slate-500 mb-1">LTV (담보인정비율)</div>
            <div className={`font-black text-2xl ${ltvOver ? "text-red-600" : "text-green-700"}`}>{ltv}%</div>
            <div className={`text-xs mt-1 font-semibold ${ltvOver ? "text-red-500" : "text-green-600"}`}>
              {ltvOver ? `⚠ 한도 ${ltvMax}% 초과` : `✓ 한도 ${ltvMax}% 이내`}
            </div>
          </div>
        )}
        {dsr !== null && (
          <div className={`rounded-xl border-2 px-4 py-3 ${dsrOver ? "bg-red-50 border-red-300" : "bg-green-50 border-green-200"}`}>
            <div className="text-xs text-slate-500 mb-1">DSR (총부채원리금상환비율)</div>
            <div className={`font-black text-2xl ${dsrOver ? "text-red-600" : "text-green-700"}`}>{dsr}%</div>
            <div className={`text-xs mt-1 font-semibold ${dsrOver ? "text-red-500" : "text-green-600"}`}>
              {dsrOver ? `⚠ 한도 ${dsrMax}% 초과` : `✓ 한도 ${dsrMax}% 이내`}
            </div>
          </div>
        )}
      </div>
      {anyOver && (
        <p className="text-xs text-red-600 mt-3">
          ※ 한도 초과 시 대출 신규 실행이 어려울 수 있어요. 갈아탈 때 재심사 대상입니다.
        </p>
      )}
      <p className="text-xs text-slate-400 mt-2">
        ※ 2025년 기준 간이 계산입니다. 실제 한도는 은행별·상품별 상이할 수 있어요.
      </p>
    </div>
  );
}
