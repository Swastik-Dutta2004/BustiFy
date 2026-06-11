"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { Search, ArrowUpRight, Menu, X } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", code: "01" },
  { href: "/passengers", label: "Passengers", code: "02" },
  { href: "/passengers/mybookings", label: "My Bookings", code: "03" },
  { href: "/conductor", label: "Conductor", code: "04" },
  { href: "/login", label: "Sign in", code: "05" },
];

const Navbar = () => {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Live status strip — feels like a real transit info bar */}
      <div className="bg-ink text-paper">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 h-9 flex items-center justify-between text-[11px] mono uppercase tracking-[0.18em]">
          <div className="flex items-center gap-5 overflow-hidden">
            <span className="flex items-center gap-2 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-tram blink" />
              <span>Live · Kolkata</span>
            </span>
            <span className="hidden md:inline opacity-60 truncate">
              Route 24 · 3 min · Howrah → Esplanade
            </span>
            <span className="hidden lg:inline opacity-60 truncate">
              AC-12 · 7 min · Salt Lake → Airport
            </span>
            <span className="hidden lg:inline opacity-60 truncate">
              S-44 · 11 min · Gariahat → Behala
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 opacity-70">
            <span>Tue · 02 Jun</span>
            <span className="opacity-50">|</span>
            <span>22°C · Clear</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="bg-paper/85 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 h-20 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3 shrink-0">
            <div className="relative">
              <div className="w-11 h-11 bg-ink text-paper rounded-md flex items-center justify-center group-hover:bg-tram group-hover:text-ink transition-colors duration-500">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" strokeLinejoin="miter">
                  <rect x="3" y="6" width="18" height="12" rx="1" />
                  <path d="M3 12h18" />
                  <path d="M7 18v2M17 18v2" />
                  <circle cx="7.5" cy="14.5" r="0.8" fill="currentColor" />
                  <circle cx="16.5" cy="14.5" r="0.8" fill="currentColor" />
                </svg>
              </div>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-tram rounded-full ring-2 ring-paper" />
            </div>
            <div className="leading-none">
              <div className="display text-[26px] text-ink font-light leading-none tracking-tight">
                Bus<span className="italic font-medium">Ti</span>FY
              </div>
              <div className="mono text-[9px] tracking-[0.25em] text-muted-foreground mt-1 uppercase">
                Est. 2024 · CCU
              </div>
            </div>
          </Link>

          {/* Search — feels like a route lookup */}
          <div className="hidden md:flex flex-1 max-w-md">
            <label className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-ink transition-colors" />
              <input
                type="text"
                placeholder="Search route no. or stop…"
                className="w-full bg-card border border-border focus:border-ink rounded-full pl-11 pr-16 py-2.5 text-sm transition-all outline-none placeholder:text-muted-foreground/70 mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 mono text-[10px] tracking-widest px-1.5 py-0.5 border border-border rounded text-muted-foreground">
                ⌘K
              </span>
            </label>
          </div>

          {/* Nav links — desktop */}
          <div className="hidden lg:flex items-center">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative px-5 py-2 flex items-center gap-2"
                >
                  <span className={`mono text-[9px] tracking-widest ${active ? "text-tram" : "text-muted-foreground"}`}>
                    {item.code}
                  </span>
                  <span
                    className={`text-sm font-medium tracking-tight transition-colors ${
                      active ? "text-ink" : "text-muted-foreground group-hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <span className="absolute left-5 right-5 -bottom-[1px] h-[2px] bg-tram" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/passengers"
              className="hidden sm:inline-flex items-center gap-2 bg-ink text-paper px-5 py-2.5 rounded-full text-sm font-medium hover:bg-tram hover:text-ink transition-colors duration-300 group"
            >
              Book a ride
              <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            </Link>
            <button
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden w-10 h-10 grid place-items-center border border-border rounded-full hover:bg-ink hover:text-paper transition-colors"
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden border-t border-border bg-paper">
            <div className="px-5 py-4 flex flex-col">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="py-3 flex items-center justify-between border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="mono text-[10px] text-muted-foreground">{item.code}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
