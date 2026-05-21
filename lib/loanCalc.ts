export type RepaymentType = "원리금균등" | "원금균등" | "만기일시";

export interface LoanInfo {
  originalAmount: number;    // 최초 대출 원금 (원)
  annualRate: number;        // 연 금리 (%)
  repaymentType: RepaymentType;
  loanStartDate: string;     // YYYY-MM-DD
  loanTermYears: number;     // 대출 기간 (년)
  earlyRepaymentFeeRate: number;
  earlyRepaymentFeeMonths: number;
}

/** 오늘 기준 경과 개월 수 */
export function monthsElapsed(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
}

/** 전체 개월 수 */
export function totalMonths(info: LoanInfo): number {
  return info.loanTermYears * 12;
}

/** 남은 개월 수 */
export function remainingMonths(info: LoanInfo): number {
  return Math.max(totalMonths(info) - monthsElapsed(info.loanStartDate), 1);
}

/** 현재 잔여 잔액 자동 계산 */
export function calcRemainingBalance(info: LoanInfo): number {
  const P = info.originalAmount;
  const r = info.annualRate / 100 / 12;
  const n = totalMonths(info);
  const k = Math.min(monthsElapsed(info.loanStartDate), n);

  switch (info.repaymentType) {
    case "원리금균등": {
      if (r === 0) return P * (1 - k / n);
      const M = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      return P * Math.pow(1 + r, k) - M * ((Math.pow(1 + r, k) - 1) / r);
    }
    case "원금균등": {
      return Math.max(P * (1 - k / n), 0);
    }
    case "만기일시": {
      return P;
    }
  }
}

/** 월 납입액 계산 (잔여 잔액 기준) */
export function calcMonthlyPayment(info: LoanInfo): number {
  const P = calcRemainingBalance(info);
  const r = info.annualRate / 100 / 12;
  const n = remainingMonths(info);

  switch (info.repaymentType) {
    case "원리금균등": {
      if (r === 0) return P / n;
      return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }
    case "원금균등": {
      return (P / n) + (P * r);
    }
    case "만기일시": {
      return P * r;
    }
  }
}

/** 월 이자 부분만 */
export function calcMonthlyInterest(info: LoanInfo): number {
  return calcRemainingBalance(info) * (info.annualRate / 100) / 12;
}

/** 중도상환수수료 계산 */
export function calcEarlyRepaymentFee(info: LoanInfo): {
  fee: number;
  isExpired: boolean;
  remainingFeeMonths: number;
} {
  const elapsed = monthsElapsed(info.loanStartDate);
  const remainingFeeMonths = Math.max(info.earlyRepaymentFeeMonths - elapsed, 0);
  const isExpired = remainingFeeMonths === 0;

  if (isExpired) return { fee: 0, isExpired: true, remainingFeeMonths: 0 };

  const feeRatio = remainingFeeMonths / info.earlyRepaymentFeeMonths;
  const fee = calcRemainingBalance(info) * (info.earlyRepaymentFeeRate / 100) * feeRatio;

  return { fee, isExpired: false, remainingFeeMonths };
}

/** 특판으로 갈아탔을 때 절감액 계산 */
export function calcSavings(info: LoanInfo, newRate: number) {
  const n = remainingMonths(info);
  const currentMonthly = calcMonthlyPayment(info);
  const newMonthly = calcMonthlyPayment({ ...info, annualRate: newRate });
  const monthlySaving = currentMonthly - newMonthly;
  const yearlySaving = monthlySaving * 12;
  const totalSaving = monthlySaving * n;

  const { fee, isExpired, remainingFeeMonths } = calcEarlyRepaymentFee(info);
  const netTotalSaving = totalSaving - fee;
  const breakEvenMonths = fee > 0 && monthlySaving > 0
    ? Math.ceil(fee / monthlySaving)
    : 0;

  return {
    monthlySaving,
    yearlySaving,
    totalSaving,
    netTotalSaving,
    fee,
    isExpired,
    remainingFeeMonths,
    breakEvenMonths,
    remainingMonths: n,
  };
}

/**
 * 손익분기 금리: 이 금리 이하여야 수수료를 내고도 이득
 * 수수료 없으면 현재 금리보다 낮으면 무조건 이득 → null 반환
 */
export function calcBreakEvenRate(info: LoanInfo): number | null {
  const { fee } = calcEarlyRepaymentFee(info);
  if (fee <= 0) return null; // 수수료 없으면 어떤 낮은 금리든 이득

  const n = remainingMonths(info);
  const currentMonthly = calcMonthlyPayment(info);

  // 이진 탐색: monthly_saving * n >= fee 를 만족하는 최대 금리
  let lo = 0.01;
  let hi = info.annualRate - 0.01;

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const newMonthly = calcMonthlyPayment({ ...info, annualRate: mid });
    const saving = (currentMonthly - newMonthly) * n;
    if (saving >= fee) {
      hi = mid; // 이 금리도 이득 → 더 높여봄
    } else {
      lo = mid; // 이득 안 됨 → 더 낮춰야 함
    }
  }

  // hi가 손익분기 금리
  return Math.round(hi * 100) / 100;
}

export type HomeCount = 0 | 1 | 2;

/** LTV 한도 (2025 기준) */
export function ltvLimit(region: string, homeCount: HomeCount): number {
  // 투기과열지구: 서울
  if (region === "서울") return homeCount === 0 ? 50 : homeCount === 1 ? 40 : 0;
  // 조정대상지역: 경기, 인천
  if (region === "경기" || region === "인천") return homeCount === 0 ? 60 : homeCount === 1 ? 50 : 0;
  // 비규제지역
  return homeCount === 0 ? 70 : homeCount === 1 ? 60 : 0;
}

/** LTV 계산 */
export function calcLTV(loanAmount: number, propertyValue: number): number {
  if (propertyValue <= 0) return 0;
  return Math.round((loanAmount / propertyValue) * 1000) / 10;
}

/** DSR 한도 */
export function dsrLimit(bank: string): number {
  const savings = ["SBI저축은행", "OK저축은행", "웰컴저축은행", "페퍼저축은행", "애큐온저축은행", "다올저축은행"];
  return savings.includes(bank) ? 50 : 40;
}

/** DSR 계산 (연소득 기준) */
export function calcDSR(monthlyPayment: number, annualIncome: number): number {
  if (annualIncome <= 0) return 0;
  return Math.round((monthlyPayment * 12 / annualIncome) * 1000) / 10;
}
