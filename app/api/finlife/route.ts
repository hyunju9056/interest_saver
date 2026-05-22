import { NextRequest, NextResponse } from "next/server";
import { fetchMortgageRates } from "@/lib/finlife";

export async function GET(req: NextRequest) {
  const apiKey = process.env.FINLIFE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key missing" }, { status: 500 });

  const propertyType = req.nextUrl.searchParams.get("property_type") ?? "";
  const repaymentType = req.nextUrl.searchParams.get("repayment_type") ?? "";

  try {
    const { banks, disclosedAt } = await fetchMortgageRates(propertyType, repaymentType);
    return NextResponse.json({ banks, disclosedAt, updatedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
