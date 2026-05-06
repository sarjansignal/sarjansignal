"use client";

import { useEffect, useMemo, useState } from "react";

type Subscriber = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  introducer: string | null;
  package_name: string;
  status: string;
  access_key: string | null;
  key_expired_at: string | null;
  last_login_at: string | null;
  created_at: string;
};

type PerfLog = {
  id: string;
  created_at: string;
  mode: "scalping" | "intraday";
  type: "buy" | "sell";
  outcome: "tp1" | "tp2" | "tp3" | "sl" | "be";
  net_pips: number;
  peak_pips: number | null;
};

type PackageLink = {
  id: string;
  token: string;
  package_name: string;
  duration_days: number;
  agent_name: string | null;
  click_count: number;
  last_clicked_at: string | null;
  is_active: boolean;
  created_at: string;
};

function formatAdminDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-GB", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [tab, setTab] = useState<"subs" | "perf" | "links">("subs");
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [logs, setLogs] = useState<PerfLog[]>([]);
  const [links, setLinks] = useState<PackageLink[]>([]);
  const [status, setStatus] = useState<string>("");

  const [newSub, setNewSub] = useState({
    name: "",
    email: "",
    phone: "",
    introducer: "",
    package_name: "Package 7D",
  });
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubDraft, setEditSubDraft] = useState({
    name: "",
    email: "",
    phone: "",
    introducer: "",
    package_name: "Package 7D",
    status: "active",
  });
  const [editDraft, setEditDraft] = useState<Record<string, { outcome: PerfLog["outcome"]; net_pips: string; peak_pips: string; note: string }>>({});
  const [newLink, setNewLink] = useState({ package_name: "Package 7D", duration_days: "7", agent_name: "" });
  const [origin, setOrigin] = useState("");
  const [perfRange, setPerfRange] = useState<"day" | "week" | "month" | "custom">("week");
  const [perfMode, setPerfMode] = useState<"all" | "scalping" | "intraday">("all");
  const [perfFrom, setPerfFrom] = useState("");
  const [perfTo, setPerfTo] = useState("");

  const headers = useMemo(() => ({ "x-admin-key": adminKey }), [adminKey]);

  const loadAll = async () => {
    try {
      setStatus("Syncing admin data...");
      const [sRes, pRes, lRes] = await Promise.all([
        fetch("/api/admin/subscribers", { headers }),
        fetch("/api/admin/performance-logs", { headers }),
        fetch("/api/admin/package-links", { headers }),
      ]);

      if (sRes.status === 401 || pRes.status === 401 || lRes.status === 401) {
        setAuthorized(false);
        setStatus("Unauthorized admin key.");
        return;
      }

      const [sJson, pJson, lJson] = await Promise.all([sRes.json(), pRes.json(), lRes.json()]);
      if (!sRes.ok) throw new Error(sJson.error ?? "Failed loading subscribers.");
      if (!pRes.ok) throw new Error(pJson.error ?? "Failed loading performance logs.");
      if (!lRes.ok) throw new Error(lJson.error ?? "Failed loading package links.");

      setSubs(sJson.data ?? []);
      setLogs(pJson.data ?? []);
      setLinks(lJson.data ?? []);
      setAuthorized(true);
      setStatus("Admin data synced.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed syncing admin data.";
      setStatus(message);
    }
  };

  useEffect(() => {
    if (!authorized || !adminKey) return;
    void loadAll();
  }, [authorized, adminKey]);

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const perfStartMs = useMemo(() => {
    const now = new Date();
    if (perfRange === "day") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start.getTime();
    }
    if (perfRange === "week") {
      const start = new Date(now);
      const jsDay = start.getDay();
      const daysFromMonday = (jsDay + 6) % 7;
      start.setDate(start.getDate() - daysFromMonday);
      start.setHours(0, 0, 0, 0);
      return start.getTime();
    }
    if (perfRange === "month") {
      return now.getTime() - 30 * 24 * 60 * 60 * 1000;
    }
    if (!perfFrom) return 0;
    return new Date(`${perfFrom}T00:00:00`).getTime();
  }, [perfRange, perfFrom]);

  const perfEndMs = useMemo(() => {
    if (perfRange !== "custom" || !perfTo) return Number.POSITIVE_INFINITY;
    return new Date(`${perfTo}T23:59:59`).getTime();
  }, [perfRange, perfTo]);

  const filteredPerfLogs = useMemo(() => {
    return logs.filter((l) => {
      if (perfMode !== "all" && l.mode !== perfMode) return false;
      const ts = new Date(l.created_at).getTime();
      return ts >= perfStartMs && ts <= perfEndMs;
    });
  }, [logs, perfMode, perfStartMs, perfEndMs]);

  const createSubscriber = async () => {
    const res = await fetch("/api/admin/subscribers", {
      method: "POST",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify(newSub),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.error ?? "Failed creating subscriber.");
      return;
    }
    setStatus("Subscriber created.");
    setNewSub({ name: "", email: "", phone: "", introducer: "", package_name: "Package 7D" });
    await loadAll();
  };

  const startEditSubscriber = (s: Subscriber) => {
    setEditingSubId(s.id);
    setEditSubDraft({
      name: s.name,
      email: s.email,
      phone: s.phone ?? "",
      introducer: s.introducer ?? "",
      package_name: s.package_name,
      status: s.status,
    });
  };

  const saveSubscriberEdit = async (id: string) => {
    const res = await fetch(`/api/admin/subscribers/${id}`, {
      method: "PATCH",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({
        name: editSubDraft.name,
        email: editSubDraft.email,
        phone: editSubDraft.phone || null,
        introducer: editSubDraft.introducer || null,
        package_name: editSubDraft.package_name,
        status: editSubDraft.status,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.error ?? "Failed updating subscriber.");
      return;
    }
    setStatus("Subscriber updated.");
    setEditingSubId(null);
    await loadAll();
  };

  const deleteSubscriber = async (id: string) => {
    const ok = window.confirm("Delete this subscriber?");
    if (!ok) return;
    const res = await fetch(`/api/admin/subscribers/${id}`, { method: "DELETE", headers });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.error ?? "Failed deleting subscriber.");
      return;
    }
    setStatus("Subscriber deleted.");
    if (editingSubId === id) setEditingSubId(null);
    await loadAll();
  };

  const saveLog = async (id: string) => {
    const d = editDraft[id];
    if (!d) return;
    const res = await fetch(`/api/admin/performance-logs/${id}`, {
      method: "PATCH",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({
        outcome: d.outcome,
        net_pips: Number(d.net_pips),
        peak_pips: d.peak_pips === "" ? null : Number(d.peak_pips),
        note: d.note || "manual admin adjustment",
        actor: "admin_crm",
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.error ?? "Failed updating log.");
      return;
    }
    setStatus("Performance log updated + audit saved.");
    await loadAll();
  };

  const createLink = async () => {
    const res = await fetch("/api/admin/package-links", {
      method: "POST",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({ package_name: newLink.package_name, duration_days: Number(newLink.duration_days), agent_name: newLink.agent_name || null }),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.error ?? "Failed creating package link.");
      return;
    }
    setStatus("Package link created.");
    await loadAll();
  };

  const createPreset = async (days: number) => {
    const label = `Package ${days}D`;
    const res = await fetch("/api/admin/package-links", {
      method: "POST",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({ package_name: label, duration_days: days, agent_name: newLink.agent_name || null }),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.error ?? `Failed creating ${label}.`);
      return;
    }
    setStatus(`${label} link created.`);
    await loadAll();
  };

  const toggleLink = async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/admin/package-links/${id}`, {
      method: "PATCH",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.error ?? "Failed updating link status.");
      return;
    }
    setStatus("Link status updated.");
    await loadAll();
  };

  const deleteLink = async (id: string) => {
    const ok = window.confirm("Delete this package link?");
    if (!ok) return;
    const res = await fetch(`/api/admin/package-links/${id}`, { method: "DELETE", headers });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.error ?? "Failed deleting link.");
      return;
    }
    setStatus("Link deleted.");
    await loadAll();
  };

  const copyLink = async (token: string) => {
    const url = `${origin}/register/${token}`;
    await navigator.clipboard.writeText(url);
    setStatus("Register link copied.");
  };

  if (!authorized) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="mx-auto max-w-md rounded-xl border border-slate-700 bg-slate-900/70 p-5">
          <h1 className="text-xl font-bold">SARJAN Admin CRM</h1>
          <p className="mt-1 text-sm text-slate-400">Enter admin key</p>
          <input value={adminKey} onChange={(e) => setAdminKey(e.target.value)} className="mt-4 w-full rounded border border-slate-600 bg-slate-950 px-3 py-2" />
          <button onClick={() => void loadAll()} className="mt-3 w-full rounded bg-blue-600 py-2 font-semibold">Unlock</button>
          {status && <p className="mt-3 text-sm text-rose-300">{status}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-5">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight">SARJAN Admin CRM</h1>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setTab("subs")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === "subs" ? "bg-blue-600" : "bg-slate-800 hover:bg-slate-700"}`}>Subscribers</button>
              <button onClick={() => setTab("perf")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === "perf" ? "bg-blue-600" : "bg-slate-800 hover:bg-slate-700"}`}>Performance Logs</button>
              <button onClick={() => setTab("links")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === "links" ? "bg-blue-600" : "bg-slate-800 hover:bg-slate-700"}`}>Package Links</button>
              <button onClick={() => void loadAll()} className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-700">Refresh</button>
            </div>
          </div>
        </header>

        {status && <p className="mb-4 text-sm text-sky-300">{status}</p>}

        {tab === "subs" ? (
          <section className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <p className="mb-3 font-semibold">Create Subscriber</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                <input placeholder="Name" value={newSub.name} onChange={(e) => setNewSub((s) => ({ ...s, name: e.target.value }))} className="rounded border border-slate-600 bg-slate-950 px-3 py-2" />
                <input placeholder="Email" value={newSub.email} onChange={(e) => setNewSub((s) => ({ ...s, email: e.target.value }))} className="rounded border border-slate-600 bg-slate-950 px-3 py-2" />
                <input placeholder="Phone" value={newSub.phone} onChange={(e) => setNewSub((s) => ({ ...s, phone: e.target.value }))} className="rounded border border-slate-600 bg-slate-950 px-3 py-2" />
                <input placeholder="Introducer" value={newSub.introducer} onChange={(e) => setNewSub((s) => ({ ...s, introducer: e.target.value }))} className="rounded border border-slate-600 bg-slate-950 px-3 py-2" />
                <select value={newSub.package_name} onChange={(e) => setNewSub((s) => ({ ...s, package_name: e.target.value }))} className="rounded border border-slate-600 bg-slate-950 px-3 py-2">
                  <option value="Package 7D">Package 7D</option>
                  <option value="Package 15D">Package 15D</option>
                  <option value="Package 30D">Package 30D</option>
                </select>
              </div>
              <button onClick={() => void createSubscriber()} className="mt-3 rounded bg-emerald-600 px-3 py-2 font-semibold">Create</button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/60">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/80">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Introducer</th>
                    <th className="px-3 py-2">Package</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Access Key</th>
                    <th className="px-3 py-2">Last Login</th>
                    <th className="px-3 py-2">Key Expiry</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => (
                    <tr key={s.id} className="border-t border-slate-800">
                      <td className="px-3 py-2">
                        {editingSubId === s.id ? (
                          <input value={editSubDraft.name} onChange={(e) => setEditSubDraft((d) => ({ ...d, name: e.target.value }))} className="w-40 rounded border border-slate-600 bg-slate-950 px-2 py-1" />
                        ) : s.name}
                      </td>
                      <td className="px-3 py-2">
                        {editingSubId === s.id ? (
                          <input value={editSubDraft.email} onChange={(e) => setEditSubDraft((d) => ({ ...d, email: e.target.value }))} className="w-48 rounded border border-slate-600 bg-slate-950 px-2 py-1" />
                        ) : s.email}
                      </td>
                      <td className="px-3 py-2">
                        {editingSubId === s.id ? (
                          <input value={editSubDraft.phone} onChange={(e) => setEditSubDraft((d) => ({ ...d, phone: e.target.value }))} className="w-32 rounded border border-slate-600 bg-slate-950 px-2 py-1" />
                        ) : (s.phone ?? "-")}
                      </td>
                      <td className="px-3 py-2">
                        {editingSubId === s.id ? (
                          <input value={editSubDraft.introducer} onChange={(e) => setEditSubDraft((d) => ({ ...d, introducer: e.target.value }))} className="w-36 rounded border border-slate-600 bg-slate-950 px-2 py-1" />
                        ) : (s.introducer ?? "-")}
                      </td>
                      <td className="px-3 py-2">
                        {editingSubId === s.id ? (
                          <select value={editSubDraft.package_name} onChange={(e) => setEditSubDraft((d) => ({ ...d, package_name: e.target.value }))} className="w-32 rounded border border-slate-600 bg-slate-950 px-2 py-1">
                            <option value="Package 7D">Package 7D</option>
                            <option value="Package 15D">Package 15D</option>
                            <option value="Package 30D">Package 30D</option>
                          </select>
                        ) : s.package_name}
                      </td>
                      <td className="px-3 py-2">
                        {editingSubId === s.id ? (
                          <select value={editSubDraft.status} onChange={(e) => setEditSubDraft((d) => ({ ...d, status: e.target.value }))} className="w-24 rounded border border-slate-600 bg-slate-950 px-2 py-1">
                            <option value="active">active</option>
                            <option value="inactive">inactive</option>
                          </select>
                        ) : s.status}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{s.access_key ?? "-"}</td>
                      <td className="px-3 py-2 text-xs">{formatAdminDate(s.last_login_at)}</td>
                      <td className="px-3 py-2 text-xs">{formatAdminDate(s.key_expired_at)}</td>
                      <td className="px-3 py-2">
                        {editingSubId === s.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => void saveSubscriberEdit(s.id)} className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold hover:bg-emerald-500">Save</button>
                            <button onClick={() => setEditingSubId(null)} className="rounded bg-slate-700 px-3 py-1 text-xs font-semibold hover:bg-slate-600">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <button onClick={() => startEditSubscriber(s)} className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold hover:bg-blue-500">Edit</button>
                            <button onClick={() => void deleteSubscriber(s.id)} className="rounded bg-rose-700 px-3 py-1 text-xs font-semibold hover:bg-rose-600">Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : tab === "perf" ? (
          <section className="space-y-3">
            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
              <div className="flex flex-wrap items-end gap-2">
                <select
                  value={perfMode}
                  onChange={(e) => setPerfMode(e.target.value as "all" | "scalping" | "intraday")}
                  className="rounded border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
                >
                  <option value="all">All Modes</option>
                  <option value="scalping">Scalping</option>
                  <option value="intraday">Intraday</option>
                </select>
                <button onClick={() => setPerfRange("day")} className={`rounded border px-3 py-2 text-xs font-semibold ${perfRange === "day" ? "border-blue-400 bg-blue-600 text-white" : "border-slate-600 bg-slate-900 hover:bg-slate-800"}`}>Day</button>
                <button onClick={() => setPerfRange("week")} className={`rounded border px-3 py-2 text-xs font-semibold ${perfRange === "week" ? "border-blue-400 bg-blue-600 text-white" : "border-slate-600 bg-slate-900 hover:bg-slate-800"}`}>Week</button>
                <button onClick={() => setPerfRange("month")} className={`rounded border px-3 py-2 text-xs font-semibold ${perfRange === "month" ? "border-blue-400 bg-blue-600 text-white" : "border-slate-600 bg-slate-900 hover:bg-slate-800"}`}>Month</button>
                <button onClick={() => setPerfRange("custom")} className={`rounded border px-3 py-2 text-xs font-semibold ${perfRange === "custom" ? "border-blue-400 bg-blue-600 text-white" : "border-slate-600 bg-slate-900 hover:bg-slate-800"}`}>Custom</button>
                {perfRange === "custom" && (
                  <>
                    <input type="date" value={perfFrom} onChange={(e) => setPerfFrom(e.target.value)} className="rounded border border-slate-600 bg-slate-950 px-2 py-2 text-xs" />
                    <input type="date" value={perfTo} onChange={(e) => setPerfTo(e.target.value)} className="rounded border border-slate-600 bg-slate-950 px-2 py-2 text-xs" />
                  </>
                )}
                <span className="ml-auto text-xs text-slate-400">Showing {filteredPerfLogs.length} logs</span>
              </div>
            </div>

            <section className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/80">
                <tr>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Mode</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Outcome</th>
                  <th className="px-3 py-2">Net Pips</th>
                  <th className="px-3 py-2">Peak Pips</th>
                  <th className="px-3 py-2">Note</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPerfLogs.map((l) => {
                  const d = editDraft[l.id] ?? {
                    outcome: l.outcome,
                    net_pips: String(l.net_pips),
                    peak_pips: l.peak_pips === null ? "" : String(l.peak_pips),
                    note: "",
                  };

                  return (
                    <tr key={l.id} className="border-t border-slate-800">
                      <td className="px-3 py-2">{formatAdminDate(l.created_at)}</td>
                      <td className="px-3 py-2">{l.mode}</td>
                      <td className="px-3 py-2">{l.type}</td>
                      <td className="px-3 py-2">
                        <select value={d.outcome} onChange={(e) => setEditDraft((p) => ({ ...p, [l.id]: { ...d, outcome: e.target.value as PerfLog["outcome"] } }))} className="rounded border border-slate-600 bg-slate-950 px-2 py-1">
                          <option value="tp1">tp1</option><option value="tp2">tp2</option><option value="tp3">tp3</option><option value="be">be</option><option value="sl">sl</option>
                        </select>
                      </td>
                      <td className="px-3 py-2"><input value={d.net_pips} onChange={(e) => setEditDraft((p) => ({ ...p, [l.id]: { ...d, net_pips: e.target.value } }))} className="w-24 rounded border border-slate-600 bg-slate-950 px-2 py-1" /></td>
                      <td className="px-3 py-2"><input value={d.peak_pips} onChange={(e) => setEditDraft((p) => ({ ...p, [l.id]: { ...d, peak_pips: e.target.value } }))} className="w-24 rounded border border-slate-600 bg-slate-950 px-2 py-1" /></td>
                      <td className="px-3 py-2"><input value={d.note} onChange={(e) => setEditDraft((p) => ({ ...p, [l.id]: { ...d, note: e.target.value } }))} className="w-48 rounded border border-slate-600 bg-slate-950 px-2 py-1" /></td>
                      <td className="px-3 py-2"><button onClick={() => void saveLog(l.id)} className="rounded bg-blue-600 px-3 py-1">Save</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </section>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
              <p className="mb-3 text-lg font-semibold tracking-tight">Create Package Link</p>
              <p className="mb-3 text-sm text-slate-400">One-click presets</p>
              <div className="mb-4 flex flex-wrap gap-2">
                <button onClick={() => void createPreset(7)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold hover:bg-blue-500">Create 7D</button>
                <button onClick={() => void createPreset(15)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold hover:bg-blue-500">Create 15D</button>
                <button onClick={() => void createPreset(30)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold hover:bg-blue-500">Create 30D</button>
              </div>
              <p className="mb-2 text-sm text-slate-400">Custom link</p>
              <div className="grid gap-2 sm:grid-cols-4">
                <input value={newLink.package_name} onChange={(e) => setNewLink((s) => ({ ...s, package_name: e.target.value }))} className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2" />
                <input value={newLink.duration_days} onChange={(e) => setNewLink((s) => ({ ...s, duration_days: e.target.value }))} className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2" />
                <input placeholder="Agent name" value={newLink.agent_name} onChange={(e) => setNewLink((s) => ({ ...s, agent_name: e.target.value }))} className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2" />
                <button onClick={() => void createLink()} className="rounded-lg bg-emerald-600 px-3 py-2 font-semibold hover:bg-emerald-500">Create Link</button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/60">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/80">
                  <tr>
                    <th className="px-3 py-2">Package</th>
                    <th className="px-3 py-2">Days</th>
                    <th className="px-3 py-2">Agent</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Clicks</th>
                    <th className="px-3 py-2">Last Click</th>
                    <th className="px-3 py-2">Register Link</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((l) => (
                    <tr key={l.id} className="border-t border-slate-800">
                      <td className="px-3 py-2">{l.package_name}</td>
                      <td className="px-3 py-2">{l.duration_days}</td>
                      <td className="px-3 py-2">{l.agent_name ?? "-"}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${l.is_active ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                          {l.is_active ? "active" : "inactive"}
                        </span>
                      </td>
                      <td className="px-3 py-2">{l.click_count ?? 0}</td>
                      <td className="px-3 py-2 text-xs">{formatAdminDate(l.last_clicked_at)}</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        <div className="max-w-[420px] truncate">{`${origin}/register/${l.token}`}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <button onClick={() => void copyLink(l.token)} className="rounded-lg bg-slate-700 px-2 py-1 text-xs font-semibold hover:bg-slate-600">Copy</button>
                          <button onClick={() => void toggleLink(l.id, l.is_active)} className={`rounded-lg px-2 py-1 text-xs font-semibold ${l.is_active ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"}`}>
                            {l.is_active ? "Disable" : "Enable"}
                          </button>
                          <button onClick={() => void deleteLink(l.id)} className="rounded-lg bg-rose-900 px-2 py-1 text-xs font-semibold hover:bg-rose-800">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
