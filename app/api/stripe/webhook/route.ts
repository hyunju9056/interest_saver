import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

// Next.js가 body를 파싱하지 않도록 설정 (Stripe 서명 검증에 필요)
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  const supabase = await createClient();

  switch (event.type) {
    // 구독 생성 (트라이얼 포함)
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      if (userId) {
        await supabase
          .from("users")
          .update({ subscription_tier: "premium" })
          .eq("id", userId);
      }
      break;
    }

    // 구독 갱신 성공
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      const userId = customer.metadata?.supabase_user_id;
      if (userId) {
        await supabase
          .from("users")
          .update({ subscription_tier: "premium" })
          .eq("id", userId);
      }
      break;
    }

    // 구독 결제 실패 또는 취소
    case "customer.subscription.deleted":
    case "invoice.payment_failed": {
      const obj = event.data.object as Stripe.Subscription | Stripe.Invoice;
      const customerId =
        "customer" in obj ? (obj.customer as string) : null;
      if (customerId) {
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const userId = customer.metadata?.supabase_user_id;
        if (userId) {
          await supabase
            .from("users")
            .update({ subscription_tier: "free" })
            .eq("id", userId);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
