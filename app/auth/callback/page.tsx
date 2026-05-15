"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase, isSupabaseReady } from "@/lib/supabase"
import { companies } from "@/lib/db"
import { useAppStore } from "@/lib/store"
import { generateGuestName } from "@/lib/types"
import type { User, UserRole } from "@/lib/types"

/**
 * /auth/callback
 * Supabase redirects here after Google OAuth.
 * We read the session, create a company row if first login,
 * then redirect to /home.
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const { setUser, setCompany } = useAppStore()
  const [status, setStatus] = useState<"loading" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    async function handle() {
      if (!isSupabaseReady() || !supabase) {
        setStatus("error")
        setErrorMsg("Supabase is not configured. Add your URL & Anon Key in lib/supabase.ts")
        return
      }

      // Supabase sets the session automatically when detectSessionInUrl: true
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        setStatus("error")
        setErrorMsg(error?.message ?? "No session found. Please try signing in again.")
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
        subscription_plan: "starter",
      }
      setUser(user)

      // Check if they already have a company; if not, create a default one
      const existing = await companies.getByOwner(su.id)
      if (existing) {
        setCompany(existing)
      } else {
        const guestName = su.user_metadata?.full_name
          ? `${su.user_metadata.full_name}'s Company`
          : generateGuestName()
        const { company } = await companies.create({
          owner_id: su.id,
          name: guestName,
          logo_url: "/default-avatar.jpg",
          subscription_plan: "starter",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        if (company) setCompany(company)
      }

      // Small delay so Zustand persist can flush before navigation
      setTimeout(() => router.replace("/home"), 300)
    }

    handle()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
      {status === "loading" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-base font-black uppercase tracking-widest">Signing you in</p>
            <p className="text-xs text-muted-foreground mt-1">Setting up your account...</p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm bg-card border-2 border-destructive shadow-[4px_4px_0px_0px] shadow-destructive p-6 flex flex-col gap-4">
          <h2 className="text-lg font-black text-destructive">Sign-in failed</h2>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
          <button
            onClick={() => router.push("/auth")}
            className="py-2.5 px-4 border-2 border-foreground bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wide shadow-[2px_2px_0px_0px] shadow-foreground active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all duration-75">
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
