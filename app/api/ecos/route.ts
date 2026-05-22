import { NextResponse } from "next/server";

// 한국은행 ECOS API
// 통계표: 121Y006 - 예금은행 대출금리(신규취급액 기준)
// 항목코드: BECBLA0302 - 주택담보대출
export async function GET() {
  const apiKey = process.env.ECOS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key missing" }, { status: 500 });

  const now = new Date();
  const end = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const start = `${startDate.getFullYear()}${String(startDate.getMonth() + 1).padStart(2, "0")}`;

  const url = `https://ecos.bok.or.kr/api/StatisticSearch/${apiKey}/json/kr/1/6/121Y006/M/${start}/${end}/BECBLA0302`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const json = await res.json();

    const rows = json?.StatisticSearch?.row;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "No data", raw: json }, { status: 404 });
    }

    const data = rows
      .map((r: { TIME: string; DATA_VALUE: string }) => ({
        month: r.TIME,
        rate: parseFloat(r.DATA_VALUE),
      }))
      .filter((d: { rate: number }) => !isNaN(d.rate));

    const latest = data[data.length - 1];

    return NextResponse.json({ latest, history: data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
