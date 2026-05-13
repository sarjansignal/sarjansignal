"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [lang, setLang] = useState<"en" | "my">("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const t = {
    navTagline: lang === "en" ? "Profitable Discipline Starts Here" : "Disiplin Profit Bermula Di Sini",
    badge: lang === "en" ? "Elite XAUUSD Signal Intelligence" : "Kepintaran Signal XAUUSD Elit",
    hero:
      lang === "en"
        ? "Profit Consistently Like a Pro Trader Even as a Newbie."
        : "Konsisten Profit Macam Pro Trader Walau Masih Newbie.",
    desc:
      lang === "en"
        ? "Straight to the point. Follow a simple A-B-C flow with professional risk guidance and precise execution."
        : "Straight to the point. Follow semudah A-B-C dengan panduan risiko profesional dan execution tepat.",
    cta: lang === "en" ? "Join The Mission" : "Sertai Misi Sekarang",
    login: "Log In",
    pricingTitle: lang === "en" ? "Choose Your Access Key_" : "Pilih Kod Akses Anda_",
    pricingSub:
      lang === "en"
        ? "Choose your mission duration and unlock disciplined execution."
        : "Pilih tempoh misi anda dan unlock execution berdisiplin.",
    testimonialsTitle: lang === "en" ? "Mission Reports (Testimonials)_" : "Laporan Misi (Testimoni)_",
    faqTitle: lang === "en" ? "Tactical Briefing (FAQ)_" : "Taklimat Taktikal (FAQ)_",
  };
  const isDark = theme === "dark";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("sarjan-landing-theme");
    if (saved === "dark" || saved === "light") setTheme(saved);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("sarjan-landing-theme", theme);
  }, [theme]);

  return (
    <main className={`min-h-screen ${isDark ? "bg-[#020617] text-white" : "bg-[#dbe5f3] text-[#0f172a]"}`}>
      <div
        className={`fixed inset-0 -z-10 [background-size:40px_40px] ${
          isDark
            ? "bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.05)_1px,transparent_0)]"
            : "bg-[radial-gradient(circle_at_2px_2px,rgba(15,23,42,0.07)_1px,transparent_0)]"
        }`}
      />

      <nav className={`sticky top-0 z-50 backdrop-blur-lg ${isDark ? "border-b border-white/10 bg-[#020617]/90" : "border-b border-[#0f172a]/10 bg-[#dbe5f3]/90"}`}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between p-6">
          <div>
            <p className="text-2xl font-black tracking-tight text-blue-500">
              SARJAN <span className={isDark ? "text-white" : "text-[#0f172a]"}>SIGNAL</span>
            </p>
            <p className={`text-[9px] uppercase tracking-[0.3em] ${isDark ? "text-white/40" : "text-[#0f172a]/45"}`}>{t.navTagline}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex rounded-full p-1 ${isDark ? "border border-white/15 bg-slate-900" : "border border-[#0f172a]/20 bg-white/80"}`}>
              <button
                onClick={() => setLang("en")}
                className={`rounded-full px-3 py-1 text-[10px] font-black transition ${lang === "en" ? "bg-blue-600 text-white" : isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("my")}
                className={`rounded-full px-3 py-1 text-[10px] font-black transition ${lang === "my" ? "bg-blue-600 text-white" : isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
              >
                MY
              </button>
            </div>
            <button
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              className={`rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-widest ${isDark ? "border-white/20 bg-white/5 text-white hover:bg-white/10" : "border-[#0f172a]/20 bg-white text-[#0f172a] hover:bg-slate-100"}`}
            >
              {isDark ? "Light" : "Dark"}
            </button>
            <Link
              href="/access"
              className={`rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-widest ${isDark ? "border-white/20 bg-white/5 text-white hover:bg-white/10" : "border-[#0f172a]/20 bg-white text-[#0f172a] hover:bg-slate-100"}`}
            >
              {t.login}
            </Link>
          </div>
        </div>
      </nav>

      <header className="mx-auto max-w-5xl px-6 pb-20 pt-24 text-center">
        <div className={`rounded-[2rem] px-6 py-10 md:px-10 ${isDark ? "" : "border border-[#0f172a]/10 bg-white/45 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl"}`}>
          <div className={`mb-8 inline-block rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${isDark ? "border border-blue-400/40 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 text-blue-300 shadow-[0_0_30px_rgba(37,99,235,0.35)]" : "border border-blue-400/50 bg-blue-100 text-blue-700 shadow-[0_8px_22px_rgba(37,99,235,0.2)]"}`}>
            {t.badge}
          </div>
          <h1 className={`mx-auto mb-8 max-w-4xl text-5xl font-extrabold leading-[1.04] tracking-tight md:text-7xl ${isDark ? "text-white" : "text-[#0f172a]"}`}>
            {t.hero.split("Pro Trader").map((part, index, arr) => (
              <span key={index}>
                {part}
                {index < arr.length - 1 && (
                  <span className={`italic ${isDark ? "text-blue-500 drop-shadow-[0_0_16px_rgba(37,99,235,0.65)]" : "text-blue-600 drop-shadow-[0_4px_12px_rgba(37,99,235,0.22)]"}`}>
                    Pro Trader
                  </span>
                )}
              </span>
            ))}
          </h1>
          <p className={`mx-auto mb-12 max-w-2xl text-lg leading-relaxed md:text-xl ${isDark ? "text-slate-400" : "text-slate-700"}`}>{t.desc}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#pricing"
              className="inline-flex min-w-[260px] items-center justify-center rounded-2xl border border-blue-300/20 bg-gradient-to-r from-blue-600 to-blue-500 px-10 py-5 text-sm font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_20px_50px_rgba(37,99,235,0.5)] transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-blue-400"
            >
              {t.cta}
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-6 pb-8 md:grid-cols-4">
        {[
          { label: "Total Pips", value: "+1505.7", darkColor: "text-emerald-400", lightColor: "text-emerald-500" },
          { label: lang === "en" ? "Win Rate" : "Kadar Menang", value: "96.3%", darkColor: "text-blue-400", lightColor: "text-blue-500" },
          { label: "Hit TP", value: "88.4%", darkColor: "text-white", lightColor: "text-[#0f172a]" },
          { label: "Drawdown", value: "4.2%", darkColor: "text-rose-500", lightColor: "text-rose-600" },
        ].map((item) => (
          <div key={item.label} className={`rounded-3xl border p-6 text-center backdrop-blur-xl ${isDark ? "border-white/12 bg-gradient-to-b from-slate-800/55 to-slate-900/45 shadow-[0_16px_40px_rgba(2,6,23,0.45)]" : "border-[#0f172a]/12 bg-gradient-to-b from-white/90 to-[#eef4ff] shadow-[0_16px_40px_rgba(15,23,42,0.15)]"}`}>
            <p className={`mb-2 text-[10px] font-black uppercase tracking-[0.18em] ${isDark ? "text-white/40" : "text-[#0f172a]/45"}`}>{item.label}</p>
            <p className={`font-mono text-3xl font-black ${isDark ? item.darkColor : item.lightColor}`}>{item.value}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-10 text-center text-3xl font-black uppercase tracking-tight">{t.testimonialsTitle}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              en: '"Zero knowledge but profit $200 in a week. ABC easy!"',
              my: '"Zero ilmu tapi boleh profit seminggu $200. Semudah ABC!"',
              name: "Wan Gold",
            },
            {
              en: '"Lot planner saved my account. Risk managed."',
              my: '"Lot planner penyelamat akaun. Risk terkawal."',
              name: "Capt. Scalp",
            },
            {
              en: '"Signals are solid, hitting TP consistently!"',
              my: '"Signal padu, TP hit memanjang!"',
              name: "Fitri R.",
            },
            {
              en: '"Perfect for office work. No chart watching."',
              my: '"Sesuai gila untuk kerja office. Tak payah hadap chart."',
              name: "Ammar XAU",
            },
            {
              en: '"Used to blow accounts, now it is growing!"',
              my: '"Dulu selalu MC, sekarang akaun makin grow!"',
              name: "Trader J",
            },
            {
              en: '"Alert hits phone, I just copy. Simple."',
              my: '"Alert masuk kat phone, terus copy. Simple."',
              name: "Syafiq K.",
            },
            {
              en: '"90% win rate is real. Tested it myself."',
              my: '"Win rate 90% real. Dah test sendiri."',
              name: "Abang Gold",
            },
            {
              en: '"Intraday setup is satisfying. Thick pips!"',
              my: '"Puas hati setup intraday. Pips lebat!"',
              name: "Zack Scalper",
            },
          ].map((item) => (
            <div key={item.name} className={`rounded-3xl border p-6 backdrop-blur-xl ${isDark ? "border-white/12 bg-gradient-to-b from-slate-800/55 to-slate-900/45 shadow-[0_16px_40px_rgba(2,6,23,0.45)]" : "border-[#0f172a]/12 bg-gradient-to-b from-white/90 to-[#eef4ff] shadow-[0_16px_40px_rgba(15,23,42,0.15)]"}`}>
              <p className={`mb-4 text-sm italic ${isDark ? "text-slate-400" : "text-slate-600"}`}>{lang === "en" ? item.en : item.my}</p>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-500">- {item.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="mb-10 text-4xl font-black uppercase tracking-tight">{t.pricingTitle}</h2>
        <p className={`mx-auto mb-10 max-w-2xl text-sm md:text-base ${isDark ? "text-slate-400" : "text-slate-600"}`}>{t.pricingSub}</p>
        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {[
            { name: "7 Days", original: "129 USD", promo: "99 USD", active: false, badge: "" },
            { name: "15 Days", original: "249 USD", promo: "199 USD", active: true, badge: "Most Popular" },
            { name: "30 Days", original: "299 USD", promo: "249 USD", active: false, badge: "" },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[2rem] border p-8 backdrop-blur-xl ${plan.active ? isDark ? "scale-[1.03] border-blue-500 bg-gradient-to-b from-blue-600/25 to-slate-900/65 shadow-[0_24px_60px_rgba(37,99,235,0.35)]" : "scale-[1.03] border-blue-400 bg-gradient-to-b from-[#dce8ff] to-[#c5d7fb] shadow-[0_24px_60px_rgba(37,99,235,0.22)]" : isDark ? "border-white/12 bg-gradient-to-b from-slate-800/55 to-slate-900/45 shadow-[0_16px_40px_rgba(2,6,23,0.45)]" : "border-[#0f172a]/12 bg-gradient-to-b from-white/90 to-[#eef4ff] shadow-[0_16px_40px_rgba(15,23,42,0.15)]"}`}
            >
              {plan.badge && (
                <p className={`mb-4 inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${isDark ? "border border-blue-400/50 bg-blue-500/20 text-blue-300" : "border border-blue-500/40 bg-blue-100 text-blue-700"}`}>
                  {plan.badge}
                </p>
              )}
              <h3 className={`text-xl font-black uppercase ${isDark ? "text-white" : "text-[#0f172a]"}`}>{plan.name}</h3>
              <div className="my-6">
                <p className={`text-sm font-semibold line-through ${isDark ? "text-slate-400" : "text-slate-500"}`}>{plan.original}</p>
                <p className={`font-mono text-5xl font-black ${plan.active ? "text-blue-600" : isDark ? "text-white" : "text-[#0f172a]"}`}>{plan.promo}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-emerald-400">Promo Active</p>
              </div>
              <ul className={`mb-6 min-h-[220px] space-y-2 text-left text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                <li>• Realtime XAUUSD Signals</li>
                <li>• Scalping Every 30 Min</li>
                <li>• Intraday 6 Times</li>
                <li>• Tactical Risk Planner</li>
                <li>• Group Support Access</li>
                <li>• Instant Notifications</li>
                <li>• Performance Dashboard</li>
              </ul>
              <Link
                href="/access"
                className={`mt-auto block w-full rounded-2xl py-4 text-xs font-black uppercase tracking-[0.16em] ${plan.active ? "bg-blue-600 hover:bg-blue-700 text-white" : isDark ? "border border-white/20 bg-white/5 text-white hover:bg-white/10" : "border border-[#0f172a]/20 bg-white text-[#0f172a] hover:bg-slate-100"}`}
              >
                {lang === "en" ? "Get Access" : "Dapatkan Akses"}
              </Link>
            </div>
          ))}
        </div>
        <p className={`mt-6 text-xs uppercase tracking-[0.14em] ${isDark ? "text-slate-500" : "text-slate-600"}`}>Secure Key • One Device Policy • Instant Access</p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <h2 className="mb-10 text-center text-3xl font-black uppercase tracking-tight">{t.faqTitle}</h2>
        <div className="space-y-4">
          {[
            {
              q: lang === "en" ? "Newbie friendly?" : "Betul ke semudah A, B, C?",
              a:
                lang === "en"
                  ? "Yes. You get Entry, TP, and SL, then execute with your own risk plan."
                  : "Ya. Anda dapat Entry, TP, dan SL, kemudian execute ikut risk plan sendiri.",
            },
            {
              q: lang === "en" ? "Signal frequency?" : "Berapa kerap signal masuk?",
              a:
                lang === "en"
                  ? "Scalping cycles every 30 minutes and intraday cycles every 4 hours."
                  : "Scalping setiap 30 minit dan intraday setiap 4 jam.",
            },
            {
              q: lang === "en" ? "Mobile friendly?" : "Boleh buka kat phone?",
              a:
                lang === "en"
                  ? "Yes, the system is optimized for phone and desktop workflows."
                  : "Ya, sistem ini dioptimumkan untuk telefon dan desktop.",
            },
            {
              q: lang === "en" ? "Need to watch chart all day?" : "Perlu hadap chart 24 jam?",
              a:
                lang === "en"
                  ? "No. Wait for the alert and execute only valid setups."
                  : "Tak perlu. Tunggu alert dan execute setup yang valid sahaja.",
            },
            {
              q: lang === "en" ? "Which pair is traded?" : "Pair apa ditrade?",
              a:
                lang === "en"
                  ? "We focus fully on Gold (XAUUSD)."
                  : "Kami fokus sepenuhnya pada Gold (XAUUSD).",
            },
            {
              q: lang === "en" ? "How to renew subscription?" : "Macam mana nak renew?",
              a:
                lang === "en"
                  ? "Contact admin before expiry to get a new access key."
                  : "Hubungi admin sebelum tarikh luput untuk kod akses baharu.",
            },
            {
              q: lang === "en" ? "Is key locked to one device?" : "Kod dikunci pada satu device?",
              a:
                lang === "en"
                  ? "Yes. One key is active on one device at one time."
                  : "Ya. Satu key aktif pada satu device pada satu masa.",
            },
            {
              q: lang === "en" ? "Is this auto trading?" : "Ini auto trading ke?",
              a:
                lang === "en"
                  ? "No. This is manual execution signal guidance."
                  : "Tidak. Ini panduan signal untuk execution manual.",
            },
            {
              q: lang === "en" ? "What if I miss a signal?" : "Kalau terlepas signal?",
              a:
                lang === "en"
                  ? "No issue. Wait for the next cycle signal."
                  : "Tiada masalah. Tunggu sahaja signal cycle seterusnya.",
            },
            {
              q: lang === "en" ? "Any risk management support?" : "Ada panduan risk management?",
              a:
                lang === "en"
                  ? "Yes, tactical lot planner is provided in dashboard."
                  : "Ya, tactical lot planner disediakan dalam dashboard.",
            },
            {
              q: lang === "en" ? "Suitable for beginner traders?" : "Sesuai untuk trader baru?",
              a:
                lang === "en"
                  ? "Yes. The flow is beginner-friendly and disciplined."
                  : "Ya. Flow ini mesra beginner dan berasaskan disiplin.",
            },
          ].map((faq) => (
            <details key={faq.q} className={`rounded-3xl border p-6 backdrop-blur-xl ${isDark ? "border-white/12 bg-gradient-to-b from-slate-800/55 to-slate-900/45 shadow-[0_14px_30px_rgba(2,6,23,0.35)]" : "border-[#0f172a]/12 bg-gradient-to-b from-white/90 to-[#eef4ff] shadow-[0_14px_30px_rgba(15,23,42,0.15)]"}`}>
              <summary className="cursor-pointer list-none text-left text-xs font-bold uppercase tracking-[0.16em]">{faq.q}</summary>
              <p className={`pt-4 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className={`border-t py-10 text-center text-[10px] font-black uppercase tracking-[0.22em] ${isDark ? "border-white/10 text-white/30" : "border-[#0f172a]/10 text-[#0f172a]/40"}`}>
        (C) 2026 SARJAN SIGNAL SYSTEM | Powered by EZ Ecosystem
      </footer>
    </main>
  );
}
