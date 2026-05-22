export interface BankOffer {
  bankName: string;
  minRate: number;
  maxRate: number;
  products: string[];
  endDate: string | null;
  joinWay: string;
  loanLmt: string;
  erlyRpayFee: string;
  spclRate: string | null;
}

function toMrtgTypeNm(propertyType: string): string | null {
  if (propertyType === "아파트") return "아파트";
  if (propertyType === "빌라" || propertyType === "단독주택") return "아파트외";
  return null;
}

function toRpayTypeNm(repaymentType: string): string | null {
  if (repaymentType === "원리금균등" || repaymentType === "원금균등") return "분할상환방식";
  if (repaymentType === "만기일시") return "만기일시상환방식";
  return null;
}

// 금감원 내부 웹 API용 rpayType 매핑 (API값 → 웹 엔드포인트값)
function toWebRpayType(rpayType: string): string {
  return rpayType === "D" ? "D2" : rpayType;
}

async function fetchSpclRate(
  finCoNo: string, finPrdtCd: string, dclsMonth: string,
  mrtgType: string, rpayType: string, lendRateType: string,
  cookieStr: string
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      dclsMonth, finCoNo, finPrdtCd, mrtgType,
      rpayType: toWebRpayType(rpayType),
      lendRateType,
    });
    const res = await fetch(
      "https://finlife.fss.or.kr/finlife/ldng/houseMrtg/selectOneMortagageLoan.ujson",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://finlife.fss.or.kr/finlife/ldng/houseMrtg/list.do",
          "X-Requested-With": "XMLHttpRequest",
          "Cookie": cookieStr,
        },
        body: params.toString(),
      }
    );
    const d = await res.json();
    const raw: string | null = d?.resultZvl?.spclRate ?? null;
    if (!raw) return null;
    return raw.replace(/&nbsp;/g, " ").replace(/<br\s*\/?>/gi, "\n").trim();
  } catch {
    return null;
  }
}

export async function fetchMortgageRates(propertyType = "", repaymentType = ""): Promise<{ banks: BankOffer[]; disclosedAt: string }> {
  const apiKey = process.env.FINLIFE_API_KEY;
  if (!apiKey) return { banks: [], disclosedAt: "" };

  const mrtgFilter = toMrtgTypeNm(propertyType);
  const rpayFilter = toRpayTypeNm(repaymentType);

  const url = `https://finlife.fss.or.kr/finlifeapi/mortgageLoanProductsSearch.json?auth=${apiKey}&topFinGrpNo=020000&pageNo=1`;

  try {
    const [mainRes, sessionRes] = await Promise.all([
      fetch(url, { next: { revalidate: 86400 } }),
      fetch("https://finlife.fss.or.kr/finlife/ldng/houseMrtg/list.do", {
        headers: { "User-Agent": "Mozilla/5.0" },
      }),
    ]);

    const json = await mainRes.json();
    const cookieStr = sessionRes.headers.getSetCookie().map((c: string) => c.split(";")[0]).join("; ");

    const baseList: Array<{
      fin_co_no: string; fin_prdt_cd: string; kor_co_nm: string;
      fin_prdt_nm: string; dcls_month: string; dcls_strt_day: string | null;
      dcls_end_day: string | null; join_way: string; loan_lmt: string; erly_rpay_fee: string;
    }> = json?.result?.baseList ?? [];

    const optionList: Array<{
      fin_co_no: string; fin_prdt_cd: string; mrtg_type_nm: string;
      rpay_type_nm: string; mrtg_type: string; rpay_type: string;
      lend_rate_type: string; lend_rate_min: number; lend_rate_max: number;
    }> = json?.result?.optionList ?? [];

    if (baseList.length === 0) return { banks: [], disclosedAt: "" };

    // 공시일: baseList에서 가장 최근 dcls_strt_day
    const latestDay = baseList
      .map((b) => b.dcls_strt_day ?? "")
      .filter(Boolean)
      .sort()
      .at(-1) ?? "";
    const disclosedAt = latestDay.length === 8
      ? `${latestDay.slice(0, 4)}.${latestDay.slice(4, 6)}.${latestDay.slice(6, 8)}`
      : "";

    // 상품별 메타 맵
    const productMeta: Record<string, {
      endDate: string | null; dclsMonth: string;
      joinWay: string; loanLmt: string; erlyRpayFee: string;
    }> = {};
    for (const base of baseList) {
      const key = `${base.fin_co_no}_${base.fin_prdt_cd}`;
      productMeta[key] = {
        endDate: base.dcls_end_day ?? null,
        dclsMonth: base.dcls_month,
        joinWay: base.join_way ?? "",
        loanLmt: base.loan_lmt ?? "",
        erlyRpayFee: base.erly_rpay_fee ?? "",
      };
    }

    const filtered = optionList.filter((o) => {
      if (mrtgFilter && o.mrtg_type_nm !== mrtgFilter) return false;
      if (rpayFilter && o.rpay_type_nm !== rpayFilter) return false;
      return true;
    });

    const optionMap: Record<string, {
      minRate: number; maxRate: number;
      mrtgType: string; rpayType: string; lendRateType: string;
    }> = {};
    for (const opt of filtered) {
      const key = `${opt.fin_co_no}_${opt.fin_prdt_cd}`;
      const lend = parseFloat(String(opt.lend_rate_min));
      const lendMax = parseFloat(String(opt.lend_rate_max));
      if (isNaN(lend)) continue;
      if (!optionMap[key] || lend < optionMap[key].minRate) {
        optionMap[key] = {
          minRate: lend,
          maxRate: isNaN(lendMax) ? lend : lendMax,
          mrtgType: opt.mrtg_type,
          rpayType: opt.rpay_type,
          lendRateType: opt.lend_rate_type,
        };
      }
    }

    const bankMap: Record<string, BankOffer> = {};
    const bankDetailParams: Record<string, {
      finCoNo: string; finPrdtCd: string; dclsMonth: string;
      mrtgType: string; rpayType: string; lendRateType: string;
    }> = {};

    for (const base of baseList) {
      const key = `${base.fin_co_no}_${base.fin_prdt_cd}`;
      const opt = optionMap[key];
      if (!opt) continue;
      const meta = productMeta[key];
      const bn = base.kor_co_nm;

      if (!bankMap[bn]) {
        bankMap[bn] = {
          bankName: bn, minRate: opt.minRate, maxRate: opt.maxRate,
          products: [], endDate: meta.endDate, spclRate: null,
          joinWay: meta.joinWay, loanLmt: meta.loanLmt, erlyRpayFee: meta.erlyRpayFee,
        };
        bankDetailParams[bn] = {
          finCoNo: base.fin_co_no, finPrdtCd: base.fin_prdt_cd,
          dclsMonth: meta.dclsMonth, mrtgType: opt.mrtgType,
          rpayType: opt.rpayType, lendRateType: opt.lendRateType,
        };
      } else if (opt.minRate < bankMap[bn].minRate) {
        bankMap[bn].minRate = opt.minRate;
        bankMap[bn].endDate = meta.endDate;
        bankMap[bn].joinWay = meta.joinWay;
        bankMap[bn].loanLmt = meta.loanLmt;
        bankMap[bn].erlyRpayFee = meta.erlyRpayFee;
        bankDetailParams[bn] = {
          finCoNo: base.fin_co_no, finPrdtCd: base.fin_prdt_cd,
          dclsMonth: meta.dclsMonth, mrtgType: opt.mrtgType,
          rpayType: opt.rpayType, lendRateType: opt.lendRateType,
        };
      } else if (opt.maxRate > bankMap[bn].maxRate) {
        bankMap[bn].maxRate = opt.maxRate;
      }
      if (!bankMap[bn].products.includes(base.fin_prdt_nm)) {
        bankMap[bn].products.push(base.fin_prdt_nm);
      }
    }

    // 우대금리 병렬 조회
    const banks = Object.values(bankMap);
    await Promise.all(
      banks.map(async (bank) => {
        const p = bankDetailParams[bank.bankName];
        if (!p) return;
        bank.spclRate = await fetchSpclRate(
          p.finCoNo, p.finPrdtCd, p.dclsMonth,
          p.mrtgType, p.rpayType, p.lendRateType,
          cookieStr
        );
      })
    );

    return { banks: banks.sort((a, b) => a.minRate - b.minRate), disclosedAt };
  } catch {
    return { banks: [], disclosedAt: "" };
  }
}
