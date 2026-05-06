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
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [designVariant, setDesignVariant] = useState<"tactical" | "executive">("executive");
  const [showKeyReminder, setShowKeyReminder] = useState(false);

  const validateName = (value: string) => {
    const trimmed = value.trim().replace(/\s+/g, " ");
    if (trimmed.length < 3) return "Please enter full name (min 3 characters).";
    const parts = trimmed.split(" ").filter(Boolean);
    if (parts.length < 2) return "Please enter full name (first and last name).";
    if (parts.some((p) => p.length < 2)) return "Each name part must be at least 2 characters.";
    if (!/^[A-Za-z\s'.-]+$/.test(trimmed)) return "Name contains invalid characters.";
    return "";
  };

  const validateEmail = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Please enter a valid email address.";
    return "";
  };

  const validatePhone = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "Phone is required.";
    if (!/^\+?[0-9]{9,15}$/.test(trimmed)) return "Please enter a valid phone number (9-15 digits).";
    return "";
  };

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("sarjan-register-theme") : null;
    if (saved === "dark" || saved === "light") setTheme(saved);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("sarjan-register-theme", theme);
  }, [theme]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("sarjan-register-design") : null;
    if (saved === "tactical" || saved === "executive") setDesignVariant(saved);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("sarjan-register-design", designVariant);
  }, [designVariant]);

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
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    if (nameError || emailError || phoneError) {
      setStatus(nameError || emailError || phoneError || "Please complete all required fields.");
      return;
    }

    const res = await fetch(`/api/register/${token}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim().replace(/\s+/g, " "), email: email.trim().toLowerCase(), phone: phone.trim() }),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.error ?? "Registration failed");
      return;
    }
    setResult({ access_key: json.access_key, expired_at: json.expired_at });
    setStatus("");
    setShowKeyReminder(true);
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
  const canSubmit = Boolean(name.trim() && email.trim() && phone.trim());

  return (
    <main className={`design-executive grid min-h-screen place-items-center p-6 ${isDark ? "bg-slate-950 text-slate-100" : "light-theme bg-[#e2e8f0] text-[#0f172a]"}`}>
      <section className={`w-full max-w-xl rounded-2xl border p-6 ${isDark ? "border-slate-700 bg-slate-900/70" : "border border-[#0f172a]/20 bg-[#f8fafc] shadow-[0_10px_30px_rgba(15,23,42,0.14)]"}`}>
        <div className="mb-3 flex justify-end gap-2">
          <button
            onClick={() => setDesignVariant((prev) => (prev === "tactical" ? "executive" : "tactical"))}
            className={`exec-head-btn rounded px-3 py-1 text-xs font-semibold ${designVariant === "executive" ? "" : "border border-slate-500 bg-slate-800 text-slate-100"}`}
          >
            {designVariant === "executive" ? "Tactical" : "Executive"}
          </button>
          <button
            onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            className={`${designVariant === "executive" ? "exec-head-btn" : "rounded px-3 py-1 text-xs font-semibold"} ${isDark ? "border border-slate-500 bg-slate-800 text-slate-100" : "border border-slate-500 bg-white text-slate-900"}`}
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
            <input
              required
              autoComplete="name"
              className={`w-full rounded border px-3 py-2 ${isDark ? "border-slate-600 bg-slate-950 text-slate-100" : "border-slate-400 bg-white text-slate-900"}`}
              placeholder="Name (e.g. Ali Ahmad)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              required
              type="email"
              autoComplete="email"
              className={`w-full rounded border px-3 py-2 ${isDark ? "border-slate-600 bg-slate-950 text-slate-100" : "border-slate-400 bg-white text-slate-900"}`}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              required
              type="tel"
              autoComplete="tel"
              className={`w-full rounded border px-3 py-2 ${isDark ? "border-slate-600 bg-slate-950 text-slate-100" : "border-slate-400 bg-white text-slate-900"}`}
              placeholder="Phone (e.g. 60123456789)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              onClick={() => void submit()}
              disabled={!canSubmit}
              className={`w-full rounded py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${isDark ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-blue-700 text-white hover:bg-blue-600"}`}
            >
              Submit & Get Access Key
            </button>
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

      {showKeyReminder && result && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4">
          <div className={`w-full max-w-md rounded-2xl border p-5 ${isDark ? "border-slate-600 bg-slate-900 text-slate-100" : "border-slate-400 bg-white text-slate-900"}`}>
            <h3 className="text-lg font-bold">Important Reminder</h3>
            <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Please copy and save your Access Key now. You will need it to log in later.
            </p>
            <div className={`mt-3 rounded border p-3 font-mono text-sm ${isDark ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-emerald-600/40 bg-emerald-50 text-emerald-900"}`}>
              {result.access_key}
            </div>
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
                Download .txt
              </button>
              <button
                onClick={() => setShowKeyReminder(false)}
                className={`rounded px-3 py-2 text-sm font-semibold ${isDark ? "border border-blue-400/50 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30" : "border border-blue-700/50 bg-blue-100 text-blue-800 hover:bg-blue-200"}`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
