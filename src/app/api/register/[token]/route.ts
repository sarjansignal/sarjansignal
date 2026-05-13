import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { generateAccessKey } from "@/lib/keygen";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Missing admin env" }, { status: 500 });
  const { token } = await params;

  const { data, error } = await admin.from("package_links").select("package_name,duration_days,is_active,click_count,agent_name").eq("token", token).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || !data.is_active) return NextResponse.json({ error: "Invalid or inactive link" }, { status: 404 });

  return NextResponse.json({ ok: true, package_name: data.package_name, duration_days: data.duration_days, agent_name: (data as { agent_name?: string | null }).agent_name ?? null });
}

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Missing admin env" }, { status: 500 });
  const { token } = await params;

  const body = (await req.json()) as { name?: string; email?: string; phone?: string };
  if (!body.name || !body.email || !body.phone) {
    return NextResponse.json({ error: "name, email and phone are required" }, { status: 400 });
  }
  const normalizedEmail = body.email.trim().toLowerCase();
  const normalizedName = body.name.trim().replace(/\s+/g, " ");
  const normalizedPhone = body.phone.trim();

  const nameParts = normalizedName.split(" ").filter(Boolean);
  if (
    normalizedName.length < 3 ||
    nameParts.length < 2 ||
    nameParts.some((p) => p.length < 2) ||
    !/^[A-Za-z\s'.-]+$/.test(normalizedName)
  ) {
    return NextResponse.json({ error: "Please enter a valid full name (first and last name)." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!/^\+?[0-9]{9,15}$/.test(normalizedPhone)) {
    return NextResponse.json({ error: "Please enter a valid phone number (9-15 digits)." }, { status: 400 });
  }

  const { data: link, error: linkError } = await admin.from("package_links").select("package_name,duration_days,is_active,agent_name").eq("token", token).maybeSingle();
  if (linkError) return NextResponse.json({ error: linkError.message }, { status: 500 });
  if (!link || !link.is_active) return NextResponse.json({ error: "Invalid or inactive link" }, { status: 404 });

  const extensionMs = Number(link.duration_days) * 24 * 60 * 60 * 1000;
  const nowMs = Date.now();

  let subscriberId = "";
  const { data: existingSub, error: existingSubError } = await admin.from("subscribers").select("id").eq("email", normalizedEmail).maybeSingle();
  if (existingSubError) return NextResponse.json({ error: existingSubError.message }, { status: 500 });

  if (existingSub) {
    subscriberId = existingSub.id;
    await admin
      .from("subscribers")
      .update({
        name: normalizedName,
        phone: normalizedPhone,
        package_name: link.package_name,
        introducer: (link as { agent_name?: string | null }).agent_name ?? null,
        status: "active",
      })
      .eq("id", subscriberId);
  } else {
    const { data: sub, error: subError } = await admin
      .from("subscribers")
      .insert({
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        package_name: link.package_name,
        introducer: (link as { agent_name?: string | null }).agent_name ?? null,
        status: "active",
      })
      .select("id")
      .single();
    if (subError) return NextResponse.json({ error: subError.message }, { status: 500 });
    subscriberId = sub.id;
  }

  const { data: existingKey, error: existingKeyError } = await admin
    .from("access_keys")
    .select("id,key,expired_at")
    .eq("subscriber_id", subscriberId)
    .maybeSingle();
  if (existingKeyError) return NextResponse.json({ error: existingKeyError.message }, { status: 500 });

  let accessKey = existingKey?.key ?? "";
  let keyErrorMsg = "";
  let expiresAt = new Date(nowMs + extensionMs).toISOString();
  if (existingKey) {
    const currentExpiryMs = existingKey.expired_at ? new Date(existingKey.expired_at).getTime() : 0;
    const baseMs = currentExpiryMs > nowMs ? currentExpiryMs : nowMs;
    expiresAt = new Date(baseMs + extensionMs).toISOString();
    const { error } = await admin
      .from("access_keys")
      .update({
        expired_at: expiresAt,
        label: `${normalizedName} | ${link.package_name}`,
        is_active: true,
      })
      .eq("id", existingKey.id);
    if (error) keyErrorMsg = error.message;
  } else {
    for (let i = 0; i < 5; i += 1) {
      accessKey = generateAccessKey(12);
      const { error } = await admin.from("access_keys").insert({
        key: accessKey,
        label: `${normalizedName} | ${link.package_name}`,
        expired_at: expiresAt,
        is_active: true,
        subscriber_id: subscriberId,
      });
      if (!error) {
        keyErrorMsg = "";
        break;
      }
      keyErrorMsg = error.message;
    }
  }

  if (keyErrorMsg) return NextResponse.json({ error: keyErrorMsg }, { status: 500 });

  const { data: linkCounterData } = await admin
    .from("package_links")
    .select("click_count")
    .eq("token", token)
    .maybeSingle();

  await admin
    .from("package_links")
    .update({
      click_count: Number((linkCounterData as { click_count?: number } | null)?.click_count ?? 0) + 1,
      last_clicked_at: new Date().toISOString(),
    })
    .eq("token", token);

  return NextResponse.json({ ok: true, access_key: accessKey, expired_at: expiresAt, package_name: link.package_name, duration_days: link.duration_days });
}
