"use client";

import Link from "next/link";

const footerLinks = {
  ride: {
    title: "Ride",
    items: [
      { l: "Plan a journey", h: "/passengers" },
      { l: "All routes", h: "/passengers" },
      { l: "My tickets", h: "/passengers/mybookings" },
      { l: "Live board", h: "/passengers" },
    ],
  },
  operate: {
    title: "Operate",
    items: [
      { l: "Conductor portal", h: "/conductor" },
      { l: "Operator KYC", h: "/conductor" },
      { l: "Fleet dashboard", h: "/conductor" },
      { l: "Become a partner", h: "/conductor" },
    ],
  },
  company: {
    title: "Company",
    items: [
      { l: "About", h: "#" },
      { l: "Press", h: "#" },
      { l: "Careers", h: "#" },
      { l: "Field notes", h: "#" },
    ],
  },
  help: {
    title: "Help",
    items: [
      { l: "Support", h: "#" },
      { l: "Refunds", h: "#" },
      { l: "Terms", h: "#" },
      { l: "Privacy", h: "#" },
    ],
  },
};

export default function Footer() {
  return (
    <footer className="bg-ink text-paper mt-12">
      {/* Big editorial word */}
      <div className="px-5 md:px-10 pt-20 pb-12 border-b border-paper/10">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex items-end justify-between mb-10">
            <div className="flex items-center gap-3">
              <span className="route-num text-2xl text-tram">§ 05</span>
              <span className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                The End of the Line
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2 mono text-[10px] tracking-widest opacity-50">
              <span className="w-1.5 h-1.5 rounded-full bg-tram blink" />
              <span>All routes operating on schedule</span>
            </div>
          </div>

          <h2 className="display text-[80px] sm:text-[120px] md:text-[180px] lg:text-[240px] leading-[0.85] tracking-[-0.04em] text-paper">
            Bus<span className="italic font-light text-tram">Ti</span>FY
            <span className="text-tram">.</span>
          </h2>

          <div className="grid grid-cols-12 gap-8 mt-12 pt-8 border-t border-paper/15">
            <div className="col-span-12 md:col-span-5">
              <p className="text-lg md:text-xl text-paper/80 max-w-md leading-relaxed">
                The real-time transit companion for the city of joy. Built in Kolkata, for
                Kolkata — and anyone passing through.
              </p>
              <form className="mt-6 flex items-center gap-2 max-w-md">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent border border-paper/30 focus:border-tram rounded-full px-5 py-3 text-sm text-paper placeholder:text-paper/40 outline-none transition-colors"
                />
                <button
                  type="button"
                  className="bg-tram text-ink px-5 py-3 rounded-full text-sm font-medium hover:bg-paper transition-colors"
                >
                  Get the dispatch
                </button>
              </form>
              <p className="mono text-[10px] tracking-widest uppercase opacity-40 mt-3">
                Weekly field notes · 0 spam, ever
              </p>
            </div>

            <div className="col-span-12 md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.values(footerLinks).map((col) => (
                <div key={col.title}>
                  <h4 className="mono text-[10px] tracking-[0.3em] uppercase text-tram mb-4">
                    — {col.title}
                  </h4>
                  <ul className="space-y-2.5">
                    {col.items.map((it) => (
                      <li key={it.l}>
                        <Link
                          href={it.h}
                          className="text-sm text-paper/70 hover:text-tram transition-colors inline-flex items-center gap-1 group"
                        >
                          {it.l}
                          <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="px-5 md:px-10 py-6">
        <div className="mx-auto max-w-[1400px] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 mono text-[10px] tracking-[0.25em] uppercase opacity-60">
            <span>© {new Date().getFullYear()} BusTiFY Transit Pvt. Ltd.</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline">Made with care in Kolkata, 22.5726°N 88.3639°E</span>
          </div>
          <div className="flex items-center gap-2">
            {["IG", "TW", "FB", "YT"].map((s) => (
              <a
                key={s}
                href="#"
                className="w-9 h-9 grid place-items-center rounded-full border border-paper/20 mono text-[10px] tracking-widest hover:bg-tram hover:text-ink hover:border-tram transition-colors"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
