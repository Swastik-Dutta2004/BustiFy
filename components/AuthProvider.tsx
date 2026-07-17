"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  login: (token: string) => void
  logout: () => void
  requireAuth: (redirectPath?: string) => boolean
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  token: null,
  login: () => {},
  logout: () => {},
  requireAuth: () => false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("token")
    if (stored) {
      setToken(stored)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((newToken: string) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    setToken(null)
    router.push("/")
  }, [router])

  const requireAuth = useCallback((redirectPath?: string) => {
    if (!token) {
      const returnTo = redirectPath || window.location.pathname + window.location.search
      router.push(`/login?from=${encodeURIComponent(returnTo)}`)
      return false
    }
    return true
  }, [token, router])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        isLoading,
        token,
        login,
        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
