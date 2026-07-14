"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpRight, MapPin, Clock, Users, ArrowRight } from "lucide-react";

const liveBoard = [
  { route: "24", from: "Howrah", to: "Esplanade", eta: "3 min", type: "Local", stops: 8 },
  { route: "AC-12", from: "Salt Lake", to: "Airport", eta: "7 min", type: "AC", stops: 12 },
  { route: "S-44", from: "Gariahat", to: "Behala", eta: "11 min", type: "Mini", stops: 9 },
  { route: "T-1", from: "Esplanade", to: "Dakshineswar", eta: "14 min", type: "Tram", stops: 11 },
  { route: "C-25", from: "Park St", to: "Sector V", eta: "18 min", type: "AC", stops: 7 },
];

const Hero = () => {
  const [time, setTime] = useState("--:--")

  useEffect(() => {
    setTime(new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }))
  }, [])

  return (
    <section className="relative pt-10 md:pt-16 pb-16 md:pb-24 px-5 md:px-10">
      <div className="mx-auto max-w-[1400px] grid grid-cols-12 gap-x-8 gap-y-10">
        {/* ── Eyebrow / Issue number ─────────────────────────── */}
        <div className="col-span-12 flex items-end justify-between border-b border-ink/80 pb-3 reveal reveal-1">
          <div className="flex items-center gap-4">
            <span className="route-num text-3xl md:text-4xl text-ink">№01</span>
            <div className="leading-tight">
              <div className="mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                The Daily Dispatch
              </div>
              <div className="display text-base text-ink">City of Joy Transit Journal</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            <span>Vol. 01</span>
            <span>·</span>
            <span>Issue 142</span>
            <span>·</span>
            <span className="stamp text-tram">Live</span>
          </div>
        </div>

        {/* ── Big editorial headline ─────────────────────────── */}
        <div className="col-span-12 lg:col-span-8 pt-4 reveal reveal-2">
          <h1 className="display text-[58px] sm:text-[88px] md:text-[120px] lg:text-[148px] leading-[0.86] tracking-[-0.04em] text-ink">
            The city,
            <br />
            <span className="italic font-light text-muted-foreground">in </span>
            <span className="relative inline-block">
              <span className="relative z-10">motion</span>
              <span className="absolute inset-x-0 bottom-2 h-[14px] md:h-[20px] bg-tram -z-0 -rotate-1" />
            </span>
            <span className="display-wonky text-muted-foreground">.</span>
          </h1>

          <p className="mt-10 max-w-2xl text-lg md:text-xl text-ink/80 leading-relaxed">
            BusTiFY is a real-time, no-fuss transit companion for{" "}
            <span className="highlight">400+ local and AC bus routes</span> across Kolkata. From
            the first tram at Esplanade to the last night service to Behala — we keep the
            timetable honest.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="/passengers"
              className="group inline-flex items-center gap-3 bg-ink text-paper pl-7 pr-3 py-3 rounded-full hover:bg-tram hover:text-ink transition-colors duration-300"
            >
              <span className="font-medium tracking-tight">Plan a journey</span>
              <span className="w-9 h-9 grid place-items-center rounded-full bg-paper text-ink group-hover:bg-ink group-hover:text-paper transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </a>
            <a
              href="#why"
              className="inline-flex items-center gap-2 px-6 py-3 border border-ink/30 rounded-full text-sm font-medium text-ink hover:border-ink hover:bg-ink hover:text-paper transition-all"
            >
              Why BusTiFY
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* ── Live board (right column) ──────────────────────── */}
        <aside className="col-span-12 lg:col-span-4 lg:pt-6 reveal reveal-3">
          <div className="bg-ink text-paper rounded-2xl p-6 md:p-7 paper-grain overflow-hidden">
            <div className="relative z-10 flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tram blink" />
                <span className="mono text-[10px] tracking-[0.3em] uppercase">
                  Live Board
                </span>
              </div>
              <span className="mono text-[10px] tracking-widest text-paper/60">
                {time}
              </span>
            </div>

            <div className="relative z-10 space-y-3">
              {liveBoard.map((b) => (
                <div
                  key={b.route}
                  className="flex items-center gap-3 py-2 border-b border-paper/10 last:border-0 group cursor-pointer"
                >
                  <div className="route-num text-2xl text-tram w-12 shrink-0 group-hover:scale-110 transition-transform">
                    {b.route}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {b.from} <span className="text-paper/50 mx-1">→</span> {b.to}
                    </div>
                    <div className="mono text-[10px] tracking-widest uppercase text-paper/50 mt-0.5">
                      {b.type} · {b.stops} stops
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="mono text-sm font-medium text-tram">{b.eta}</div>
                    <div className="mono text-[9px] tracking-widest uppercase text-paper/40">
                      ETA
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-5 pt-4 border-t border-paper/10 flex items-center justify-between">
              <span className="mono text-[10px] tracking-widest uppercase text-paper/50">
                5 of 412 routes
              </span>
              <a
                href="/passengers"
                className="mono text-[10px] tracking-widest uppercase text-tram flex items-center gap-1 hover:gap-2 transition-all"
              >
                See all <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </aside>

        {/* ── Stats strip ────────────────────────────────────── */}
        <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 border-y border-ink/80 divide-x divide-ink/15 reveal reveal-4">
          {[
            { num: "412", label: "Active Routes", sub: "+18 this month" },
            { num: "1.2M", label: "Tickets Sold", sub: "Q1 2025" },
            { num: "98.4%", label: "On-time", sub: "Last 30 days" },
            { num: "₹8", label: "Avg. Fare", sub: "Across all routes" },
          ].map((s, i) => (
            <div key={i} className="p-5 md:p-7 group hover:bg-ink hover:text-paper transition-colors duration-500">
              <div className="route-num text-4xl md:text-5xl lg:text-6xl leading-none">
                {s.num}
              </div>
              <div className="mt-3 mono text-[10px] tracking-[0.25em] uppercase">
                {s.label}
              </div>
              <div className="mt-1 text-xs opacity-60">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Sub-features row ───────────────────────────────── */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-3 reveal reveal-5">
          {[
            {
              icon: <MapPin className="w-4 h-4" />,
              title: "Live tracking",
              desc: "Every bus, every minute, on the map.",
            },
            {
              icon: <Clock className="w-4 h-4" />,
              title: "Instant booking",
              desc: "Confirm a seat in under 12 seconds.",
            },
            {
              icon: <Users className="w-4 h-4" />,
              title: "Conductor verified",
              desc: "Every operator onboarded with KYC.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-5 border border-border rounded-2xl bg-card/60 hover:border-ink hover:-translate-y-0.5 transition-all"
            >
              <div className="w-9 h-9 grid place-items-center rounded-full bg-ink text-paper shrink-0">
                {f.icon}
              </div>
              <div>
                <div className="font-medium text-ink">{f.title}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
