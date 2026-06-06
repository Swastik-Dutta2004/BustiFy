"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Bus } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        return;
      }
      alert("Welcome to BusTiFY. Your first ticket is on us.");
      router.push("/login");
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const strength =
    password.length === 0 ? null : password.length < 6 ? "weak" : password.length < 10 ? "good" : "strong";
  const strengthColor =
    strength === "weak" ? "bg-red-500" : strength === "good" ? "bg-yellow-400" : "bg-tram";
  const strengthWidth =
    strength === "weak" ? "w-1/3" : strength === "good" ? "w-2/3" : "w-full";

  return (
    <div className="h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] overflow-hidden">

      {/* ── Left panel ─────────────────────────────────── */}
      <aside className="relative hidden lg:flex flex-col justify-between bg-ink text-paper p-10 overflow-hidden paper-grain">

        {/* Decorative route lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 500 700" preserveAspectRatio="none">
          <path d="M-50 180 Q180 80 320 200 T600 120" stroke="oklch(0.82 0.135 78)" strokeWidth="1" fill="none" strokeDasharray="5 5"/>
          <path d="M-50 380 Q200 280 380 360 T650 260" stroke="oklch(0.82 0.135 78)" strokeWidth="1" fill="none" strokeDasharray="5 5"/>
          <path d="M-50 560 Q160 460 300 520 T600 440" stroke="oklch(0.82 0.135 78)" strokeWidth="1" fill="none" strokeDasharray="5 5"/>
        </svg>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-tram text-ink grid place-items-center">
            <Bus className="w-4 h-4" />
          </div>
          <span className="display text-xl tracking-tight">Bus<span className="italic font-light">Ti</span>FY</span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10">
          <p className="mono text-[10px] tracking-[0.35em] uppercase text-tram mb-4">№ 03 · New Passenger</p>
          <h1 className="display text-6xl xl:text-7xl leading-[0.9] tracking-tight mb-5">
            Every<br/>
            journey<br/>
            <span className="italic font-light text-paper/40">starts</span><br/>
            <span className="text-tram">here.</span>
          </h1>
          <p className="text-paper/50 text-sm leading-relaxed max-w-xs">
            1.2 million Kolkatans. 412 routes. One honest booking platform.
          </p>
        </div>

        {/* Bottom stats strip */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-paper/10">
          {[["412", "Routes"], ["1.2M", "Riders"], ["₹50", "First ride off"]].map(([val, label]) => (
            <div key={label}>
              <div className="display text-2xl text-tram leading-none">{val}</div>
              <div className="mono text-[9px] tracking-widest uppercase text-paper/40 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Right — form ───────────────────────────────── */}
      <section className="flex flex-col justify-center px-6 md:px-14 lg:px-16 py-8 bg-paper overflow-y-auto">
        <div className="w-full max-w-sm mx-auto">

          {/* Top nav */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 rounded bg-ink text-paper grid place-items-center">
                <Bus className="w-3.5 h-3.5" />
              </div>
              <span className="display text-base">Bus<span className="italic font-light">Ti</span>FY</span>
            </div>
            <span className="mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground hidden lg:block">
              REG · 01
            </span>
            <Link
              href="/login"
              className="mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-ink transition-colors flex items-center gap-1"
            >
              Sign in <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="display text-4xl leading-[0.95] tracking-tight text-ink mb-1.5">
              Create<br/>account.
            </h2>
            <p className="text-xs text-muted-foreground">
              30 seconds.{" "}
              <Link href="/login" className="text-ink underline decoration-tram decoration-2 underline-offset-2">
                Already have one?
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-5">

            {/* Name */}
            <div className="group">
              <label className="mono text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">
                Full name
              </label>
              <input
                type="text"
                required
                placeholder="Arnab Mukherjee"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-b border-ink/20 group-focus-within:border-ink px-0 py-2 text-sm font-medium outline-none transition-colors placeholder:text-ink/20"
              />
            </div>

            {/* Email */}
            <div className="group">
              <label className="mono text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@kolkata.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-ink/20 group-focus-within:border-ink px-0 py-2 text-sm font-medium outline-none transition-colors placeholder:text-ink/20"
              />
            </div>

            {/* Password */}
            <div className="group">
              <label className="mono text-[9px] tracking-[0.25em] uppercase text-muted-foreground block mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-ink/20 group-focus-within:border-ink px-0 py-2 text-sm font-medium outline-none transition-colors placeholder:text-ink/20"
              />
              {/* Strength bar */}
              <div className="mt-1.5 h-0.5 w-full bg-ink/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${strengthWidth} ${strengthColor}`} />
              </div>
              {strength && (
                <p className="mono text-[9px] tracking-widest uppercase mt-1 text-muted-foreground">
                  {strength}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-ink text-paper py-3 rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-tram hover:text-ink transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? "Creating…" : "Create account"}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <p className="text-[10px] text-muted-foreground/60 text-center">
              By continuing you agree to our{" "}
              <a href="#" className="text-ink/60 underline">Terms</a> &{" "}
              <a href="#" className="text-ink/60 underline">Privacy</a>.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}