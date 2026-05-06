import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isAdminAuthorized } from "@/lib/admin-auth";

export async function GET(req: Request) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Missing admin env" }, { status: 500 });

  const { data, error } = await admin.from("performance_logs").select("*").order("created_at", { ascending: false }).limit(300);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, data });
}
