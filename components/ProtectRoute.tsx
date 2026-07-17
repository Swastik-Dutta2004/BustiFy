"use client"

import { useAuth } from "./AuthProvider"
import { useRouter, usePathname } from "next/navigation"
import { Loader2, Lock, ArrowRight, Bus } from "lucide-react"
import Link from "next/link"

export default function ProtectRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="mono text-[10px] tracking-widest uppercase">Verifying session…</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    const fullPath = pathname + (typeof window !== "undefined" ? window.location.search : "")
    const returnTo = encodeURIComponent(fullPath)
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-5">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-ink text-paper grid place-items-center mb-6">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="display text-2xl md:text-3xl text-ink mb-2">
            Login required
          </h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Please log in to continue your booking. Your search results and selected bus will be waiting for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/login?from=${returnTo}`}
              className="group bg-ink text-paper px-6 py-3 rounded-full font-medium text-sm flex items-center justify-center gap-2 hover:bg-tram hover:text-ink transition-all duration-300"
            >
              Log in
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={`/signup?from=${returnTo}`}
              className="border border-ink/20 text-ink px-6 py-3 rounded-full font-medium text-sm flex items-center justify-center gap-2 hover:border-ink hover:bg-ink hover:text-paper transition-all duration-300"
            >
              Create account
            </Link>
          </div>

          <button
            onClick={() => router.back()}
            className="mt-6 mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-ink transition-colors"
          >
            ← Go back
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
