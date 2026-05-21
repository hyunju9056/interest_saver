import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3000";

  const customers = await stripe.customers.list({ email: user.email });
  if (customers.data.length === 0) {
    return NextResponse.json({ error: "구독 정보가 없습니다." }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customers.data[0].id,
    return_url: `${origin}/dashboard`,
  });

  return NextResponse.json({ url: portalSession.url });
}
