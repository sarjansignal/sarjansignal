"use client";

import { useEffect, useState } from "react";

export default function RegisterPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState("");
  const [pkg, setPkg] = useState<{ package_name: string; duration_days: number } | null>(null);
  const [status, setStatus] = useState("Loading package...");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<{ access_key: string; expired_at: string } | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("sarjan-register-theme") : null;
    if (saved === "dark" || saved === "light") setTheme(saved);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("sarjan-register-theme", theme);
  }, [theme]);

  useEffect(() => {
    void (async () => {
      const p = await params;
      setToken(p.token);
      const res = await fetch(`/api/register/${p.token}`);
      const json = await res.json();
      if (!res.ok) {
        setStatus(json.error ?? "Invalid link");
        return;
      }
      setPkg({ package_name: json.package_name, duration_days: json.duration_days });
      setStatus("");
    })();
  }, [params]);

  const submit = async () => {
    const res = await fetch(`/api/register/${token}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, phone }),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.error ?? "Registration failed");
      return;
    }
    setResult({ access_key: json.access_key, expired_at: json.expired_at });
    setStatus("");
  };

  const copyKey = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.access_key);
    setStatus("Access key copied.");
  };

  const downloadKeyTxt = () => {
    if (!result) return;
    const lines = [
      "SARJAN SIGNAL SYSTEM - ACCESS KEY",
      `Access Key: ${result.access_key}`,
      `Expires At: ${new Date(result.expired_at).toLocaleString()}`,
      `Package: ${pkg?.package_name ?? "-"}`,
      `Duration: ${pkg?.duration_days ?? "-"} days`,
    ];
    const blob = new Blob([`${lines.join("\n")}\n`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sarjan-access-key-${result.access_key}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus("Access key file downloaded.");
  };

  const isDark = theme === "dark";

  return (
    <main className={`min-h-screen p-6 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-200 text-slate-900"}`}>
      <section className={`mx-auto max-w-xl rounded-2xl border p-6 ${isDark ? "border-slate-700 bg-slate-900/70" : "border-slate-400 bg-white/90 shadow-md"}`}>
        <div className="mb-3 flex justify-end">
          <button
            onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            className={`rounded px-3 py-1 text-xs font-semibold ${isDark ? "border border-slate-500 bg-slate-800 text-slate-100" : "border border-slate-500 bg-white text-slate-900"}`}
          >
            {isDark ? "Light" : "Dark"}
          </button>
        </div>
        <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>SARJAN Registration</h1>
        <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>Complete your details to receive access key instantly.</p>

        {status && <p className={`mt-4 rounded px-3 py-2 text-sm ${status.includes("copied") || status.includes("Loading") || status === "" ? (isDark ? "bg-sky-500/10 text-sky-300" : "bg-sky-100 text-sky-700") : (isDark ? "bg-rose-500/10 text-rose-300" : "bg-rose-100 text-rose-700")}`}>{status}</p>}

        {pkg && !result && (
          <div className="mt-4 space-y-3">
            <div className={`rounded border px-3 py-2 text-sm ${isDark ? "border-slate-700 bg-slate-950/70 text-slate-200" : "border-slate-400 bg-slate-50 text-slate-800"}`}>Package: <span className="font-semibold">{pkg.package_name}</span> ({pkg.duration_days} days)</div>
            <input className={`w-full rounded border px-3 py-2 ${isDark ? "border-slate-600 bg-slate-950 text-slate-100" : "border-slate-400 bg-white text-slate-900"}`} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className={`w-full rounded border px-3 py-2 ${isDark ? "border-slate-600 bg-slate-950 text-slate-100" : "border-slate-400 bg-white text-slate-900"}`} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={`w-full rounded border px-3 py-2 ${isDark ? "border-slate-600 bg-slate-950 text-slate-100" : "border-slate-400 bg-white text-slate-900"}`} placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button onClick={() => void submit()} className={`w-full rounded py-2 font-semibold ${isDark ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-blue-700 text-white hover:bg-blue-600"}`}>Submit & Get Access Key</button>
          </div>
        )}

        {result && (
          <div className={`mt-5 rounded border p-4 ${isDark ? "border-emerald-500/40 bg-emerald-500/10" : "border-emerald-600/50 bg-emerald-50"}`}>
            <p className={`text-sm ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>Your Access Key</p>
            <p className={`mt-1 text-2xl font-bold ${isDark ? "text-emerald-200" : "text-emerald-900"}`}>{result.access_key}</p>
            <p className={`mt-2 text-xs ${isDark ? "text-emerald-300/80" : "text-emerald-800/80"}`}>Expires at: {new Date(result.expired_at).toLocaleString()}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => void copyKey()}
                className={`rounded px-3 py-2 text-sm font-semibold ${isDark ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-emerald-700 text-white hover:bg-emerald-600"}`}
              >
                Copy Access Key
              </button>
              <button
                onClick={downloadKeyTxt}
                className={`rounded px-3 py-2 text-sm font-semibold ${isDark ? "border border-slate-500 bg-slate-800 text-slate-100 hover:bg-slate-700" : "border border-slate-500 bg-white text-slate-900 hover:bg-slate-100"}`}
              >
                Download Key (.txt)
              </button>
              <a
                href="/"
                className={`rounded px-3 py-2 text-sm font-semibold ${isDark ? "border border-blue-400/60 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30" : "border border-blue-700/50 bg-blue-100 text-blue-800 hover:bg-blue-200"}`}
              >
                Go to Login
              </a>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
