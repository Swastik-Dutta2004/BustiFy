"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Bus, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="mono text-[10px] tracking-widest uppercase">Loading…</span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("from") || "/";
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [keepSigned, setKeepSigned] = useState(true);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
        return;
      }
      login(data.token);
      router.push(returnTo);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-9rem)] grid grid-cols-1 lg:grid-cols-2">
      {/* Left — editorial panel */}
      <aside className="relative bg-ink text-paper overflow-hidden paper-grain p-6 md:p-10 flex flex-col justify-between min-h-[420px] lg:min-h-[calc(100vh-9rem)]">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-md bg-tram text-ink grid place-items-center">
              <Bus className="w-4 h-4" />
            </div>
            <span className="display text-xl">
              Bus<span className="italic">Ti</span>FY
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="route-num text-xl text-tram">№ 02</span>
            <span className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
              Sign in
            </span>
          </div>

          <h1 className="display text-4xl md:text-5xl xl:text-6xl leading-[0.95] tracking-tight mb-4">
            Welcome <br />
            <span className="italic font-light text-tram">back, traveller.</span>
          </h1>

          <p className="text-paper/70 text-sm md:text-base max-w-md leading-relaxed">
            Pick up where you left off. Your tickets, saved routes, and recent
            journeys are waiting on the dashboard.
          </p>
        </div>

        {/* Faux ticket */}
        <div className="relative z-10 max-w-sm mt-6">
          <div className="bg-paper text-ink rounded-xl p-4 border border-paper/10 paper-grain">
            <div className="relative z-10 flex items-center justify-between mb-3">
              <div className="mono text-[10px] tracking-widest text-muted-foreground">
                BUS<span className="text-tram">·</span>TIFY
              </div>
              <span className="stamp text-tram">Member</span>
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="route-num text-3xl text-ink">412</div>
              <div className="flex-1">
                <div className="text-sm font-medium">Routes unlocked</div>
                <div className="mono text-[10px] tracking-widest text-muted-foreground">
                  Standard · AC · Tram
                </div>
              </div>
              <div className="route-num text-2xl text-tram">5%</div>
            </div>
            <div className="relative z-10 ticket-stitch my-3 h-px" />
            <div className="relative z-10 mono text-[10px] tracking-widest text-muted-foreground flex items-center justify-between">
              <span>MEMBER · SINCE 2024</span>
              <span>•••• 24</span>
            </div>
          </div>
        </div>

        {/* Decorative route lines */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <svg className="w-full h-full" viewBox="0 0 400 600" preserveAspectRatio="none">
            <path
              d="M -50 500 Q 100 400 200 450 T 500 380"
              stroke="oklch(0.82 0.135 78)"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="4 4"
            />
            <path
              d="M -50 100 Q 150 200 250 150 T 500 220"
              stroke="oklch(0.82 0.135 78)"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="4 4"
            />
          </svg>
        </div>
      </aside>

      {/* Right — form */}
      <section className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-5">
            <span className="mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              Form · LOG-01
            </span>
            <Link
              href={`/signup?from=${encodeURIComponent(returnTo)}`}
              className="text-sm font-medium text-ink hover:text-tram transition-colors flex items-center gap-1.5"
            >
              Need an account? <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <h2 className="display text-3xl md:text-4xl leading-tight tracking-tight mb-1 text-ink">
            Sign in.
          </h2>
          <p className="text-muted-foreground text-xs mb-6">
            Use your registered email. New here?{" "}
            <Link
              href={`/signup?from=${encodeURIComponent(returnTo)}`}
              className="text-ink font-medium underline decoration-tram decoration-2 underline-offset-4"
            >
              Create an account
            </Link>
            .
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mono text-[10px] tracking-widest uppercase text-muted-foreground ml-1 block mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@kolkata.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b-2 border-ink/20 focus:border-ink rounded-none px-1 py-2.5 text-base font-medium outline-none transition-colors placeholder:text-muted-foreground/50"
              />
            </div>

            <div>
              <label className="mono text-[10px] tracking-widest uppercase text-muted-foreground ml-1 block mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b-2 border-ink/20 focus:border-ink rounded-none px-1 py-2.5 text-base font-medium outline-none transition-colors placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <span
                  className={`w-4 h-4 rounded-sm border-2 grid place-items-center transition-colors ${
                    keepSigned ? "bg-ink border-ink" : "border-ink/30"
                  }`}
                >
                  {keepSigned && (
                    <svg viewBox="0 0 12 12" className="w-3 h-3 text-paper">
                      <path
                        d="M2 6 L5 9 L10 3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={keepSigned}
                  onChange={(e) => setKeepSigned(e.target.checked)}
                />
                <span className="text-xs text-ink">Keep me signed in</span>
              </label>
              <a href="#" className="text-xs text-muted-foreground hover:text-ink">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-ink text-paper py-3.5 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-tram hover:text-ink transition-colors duration-300 disabled:opacity-50"
            >
              {loading ? "Signing you in…" : "Continue to BusTiFY"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mono text-[10px] tracking-widest uppercase text-muted-foreground mt-5 text-center">
            Protected by end-to-end encryption · WCAG 2.2 AA
          </p>
        </div>
      </section>
    </div>
  );
}
