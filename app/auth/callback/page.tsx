"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase, isSupabaseReady } from "@/lib/supabase"
import { useAppStore } from "@/lib/store"
import type { User } from "@/lib/types"
import type { UserRole } from "@/lib/types"

/**
 * /auth/callback
 * Supabase redirects here after Google OAuth.
 * We exchange the URL hash for a session, save the user,
 * then redirect to /home.
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const { setUser } = useAppStore()
  const [status, setStatus] = useState<"loading" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    async function handle() {
      if (!isSupabaseReady() || !supabase) {
        setStatus("error")
        setErrorMsg("Supabase is not configured. Add credentials in lib/supabase.ts")
        return
      }

      // Supabase handles the hash automatically when detectSessionInUrl: true
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        setStatus("error")
        setErrorMsg(error?.message ?? "No session found after OAuth. Please try again.")
        return
      }

      const su = data.session.user
      const user: User = {
        id: su.id,
        email: su.email!,
        name: su.user_metadata?.full_name ?? su.user_metadata?.name,
        avatar_url: su.user_metadata?.avatar_url,
        role: (su.user_metadata?.role as UserRole) ?? "company_owner",
        created_at: su.created_at,
        updated_at: new Date().toISOString(),
        is_verified: !!su.email_confirmed_at,
        two_factor_enabled: false,
        profile_completeness: 30,
      }

      setUser(user)
      // Small delay so Zustand persist can flush before navigation
      setTimeout(() => router.replace("/home"), 200)
    }

    handle()
  }, [router, setUser])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
      {status === "loading" ? (
        <>
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Signing you in...</p>
        </>
      ) : (
        <div className="w-full max-w-sm bg-card border-2 border-destructive shadow-[4px_4px_0px_0px] shadow-destructive p-6 flex flex-col gap-4">
          <h2 className="text-lg font-black text-destructive">Sign-in failed</h2>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
          <button
            onClick={() => router.push("/auth")}
            className="py-2.5 px-4 border-2 border-foreground bg-primary text-primary-foreground font-bold text-sm uppercase hover:opacity-90 transition-opacity">
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
