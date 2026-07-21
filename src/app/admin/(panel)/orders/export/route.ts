import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** CSV export of orders — admin/staff only (checked here AND by RLS). */
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const status = request.nextUrl.searchParams.get("status");
  let query = supabase
    .from("orders")
    .select(
      "order_number, status, created_at, customer_name, email, phone, total_cents, discount_cents, discount_code, has_unpriced_items, payment_method, payment_status, customer_notes, schedule:market_schedules(market_date, location:locations(name))",
    )
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data: orders, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = [
    "Order number",
    "Status",
    "Placed at",
    "Customer",
    "Email",
    "Phone",
    "Pickup date",
    "Pickup location",
    "Total (CAD)",
    "Discount (CAD)",
    "Discount code",
    "Has unpriced items",
    "Payment method",
    "Payment status",
    "Customer note",
  ];

  const rows = (orders ?? []).map((o) => {
    const schedule = Array.isArray(o.schedule) ? o.schedule[0] : o.schedule;
    const location = Array.isArray(schedule?.location)
      ? schedule?.location[0]
      : schedule?.location;
    return [
      o.order_number,
      o.status,
      o.created_at,
      o.customer_name,
      o.email,
      o.phone,
      schedule?.market_date ?? "",
      location?.name ?? "",
      (o.total_cents / 100).toFixed(2),
      o.discount_cents ? (o.discount_cents / 100).toFixed(2) : "",
      o.discount_code ?? "",
      o.has_unpriced_items ? "yes" : "no",
      o.payment_method,
      o.payment_status,
      o.customer_notes ?? "",
    ]
      .map(csvEscape)
      .join(",");
  });

  const csv = [header.map(csvEscape).join(","), ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reems-kitchen-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
