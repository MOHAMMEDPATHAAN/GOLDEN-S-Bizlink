"use client"

// ============================================
// BIZLINK — Auth Page (Sign In / Sign Up)
// Clean, compact, hitech Neo-Brutalism
// Developer: GOLDEN'S (Golden techS)
// ============================================

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Eye, EyeOff, Mail, Lock, User, Phone, Building2,
  ArrowLeft, ArrowRight, CheckCircle, AlertCircle,
  Zap, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { auth, companies } from "@/lib/db"
import { useAppStore } from "@/lib/store"
import { isSupabaseReady } from "@/lib/supabase"
import { generateGuestName } from "@/lib/types"

// ─── Password strength meter ───────────────────────────────────────────────
function pwStrength(pw: string): { score: number; label: string; cls: string } {
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  const map = [
    { score: 0, label: "", cls: "" },
    { score: 1, label: "Weak", cls: "bg-red-500" },
    { score: 2, label: "Fair", cls: "bg-orange-400" },
    { score: 3, label: "Good", cls: "bg-yellow-400" },
    { score: 4, label: "Strong", cls: "bg-green-500" },
    { score: 5, label: "Very Strong", cls: "bg-green-600" },
  ]
  return map[Math.min(s, 5)]
}

// ─── Reusable input ───────────────────────────────────────────────────────
function Field({
  label, id, type = "text", value, onChange,
  placeholder, icon: Icon, error, required, autoComplete,
}: {
  label: string; id: string; type?: string; value: string
  onChange: (v: string) => void; placeholder?: string
  icon?: React.ElementType; error?: string; required?: boolean
  autoComplete?: string
}) {
  const [show, setShow] = useState(false)
  const isPass = type === "password"
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">
        {label}{required && <span className="text-primary ml-0.5">*</span>}
      </label>
      <div className={cn(
        "flex items-center gap-0 border-2 bg-card transition-colors duration-75",
        error ? "border-destructive" : "border-foreground/30 focus-within:border-primary"
      )}>
        {Icon && <Icon className="w-3.5 h-3.5 ml-3 text-muted-foreground shrink-0" />}
        <input
          id={id}
          type={isPass ? (show ? "text" : "password") : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="flex-1 px-3 py-2.5 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40 min-w-0"
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="px-3 text-muted-foreground hover:text-foreground transition-colors duration-75"
          >
            {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-destructive font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

// ─── Brutalist button — zero-latency active feedback ─────────────────────
function Btn({
  children, onClick, type = "button", loading, variant = "primary",
  className, disabled,
}: {
  children: React.ReactNode; onClick?: () => void; type?: "button" | "submit"
  loading?: boolean; variant?: "primary" | "secondary" | "ghost"
  className?: string; disabled?: boolean
}) {
  const base = cn(
    "w-full flex items-center justify-center gap-2 py-2.5 px-4",
    "text-xs font-black uppercase tracking-widest border-2",
    "transition-all duration-75 select-none",
    "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
  )
  const variants = {
    primary: "bg-primary text-primary-foreground border-foreground shadow-[3px_3px_0px_0px] shadow-foreground hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px]",
    secondary: "bg-background text-foreground border-foreground/40 shadow-[2px_2px_0px_0px] shadow-foreground/30 hover:border-foreground hover:shadow-[3px_3px_0px_0px]",
    ghost: "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:border-foreground/20 shadow-none",
  }
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(base, variants[variant], className)}
    >
      {loading
        ? <><span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />Please wait</>
        : children}
    </button>
  )
}

// ─── OTP input boxes ──────────────────────────────────────────────────────
function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i} id={`otp-${i}`}
          type="text" inputMode="numeric" maxLength={1}
          value={value[i] ?? ""}
          onChange={e => {
            const d = e.target.value.replace(/\D/, "")
            const arr = value.split("")
            arr[i] = d
            onChange(arr.join("").slice(0, 6))
            if (d && i < 5) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus()
          }}
          onKeyDown={e => {
            if (e.key === "Backspace" && !value[i] && i > 0)
              (document.getElementById(`otp-${i - 1}`) as HTMLInputElement)?.focus()
          }}
          className="w-10 h-11 text-center text-base font-black border-2 border-foreground/30 bg-card focus:border-primary outline-none transition-colors"
        />
      ))}
    </div>
  )
}

// ─── Shared page wrapper ──────────────────────────────────────────────────
function Shell({ children, onBack }: { children: React.ReactNode; onBack?: () => void }) {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-3 px-4 py-3 border-b-2 border-foreground/20">
        <button
          onClick={onBack ?? (() => router.push("/"))}
          className="p-1.5 border-2 border-foreground/20 hover:border-foreground active:translate-x-[1px] active:translate-y-[1px] transition-all duration-75"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-sm font-black golden-text tracking-wider">BIZLINK</span>
          <p className="text-[10px] text-muted-foreground">by Golden techS</p>
        </div>
      </header>
      <main className="flex-1 flex items-start justify-center p-4 pt-8">
        <div className="w-full max-w-sm bg-card border-2 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground p-5">
          {children}
        </div>
      </main>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
//  MAIN AUTH PAGE
// ════════════════════════════════════════════════════════════════════════════
type Tab = "signin" | "signup"
type View = "main" | "forgot" | "otp" | "reset"
type SignupStep = "account" | "company" | "verify"

export default function AuthPage() {
  const router = useRouter()
  const { selectedRole, setUser, setCompany, isAuthenticated } = useAppStore()

  const [tab, setTab] = useState<Tab>("signin")
  const [view, setView] = useState<View>("main")
  const [step, setStep] = useState<SignupStep>("account")

  // Loading states
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)

  // Feedback
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Sign-in fields
  const [siEmail, setSiEmail] = useState("")
  const [siPassword, setSiPassword] = useState("")

  // Sign-up Step 1
  const [suEmail, setSuEmail] = useState("")
  const [suPassword, setSuPassword] = useState("")
  const [suConfirm, setSuConfirm] = useState("")
  const [suAgreed, setSuAgreed] = useState(false)

  // Sign-up Step 2 (company details)
  const [coName, setCoName] = useState("")
  const [ceoName, setCeoName] = useState("")
  const [coPhone, setCoPhone] = useState("")
  const [coCountry, setCoCountry] = useState("")
  const [coIndustry, setCoIndustry] = useState("")

  // Forgot/OTP/Reset
  const [fpEmail, setFpEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmNewPw, setConfirmNewPw] = useState("")
  const [otpTimer, setOtpTimer] = useState(0)

  // OTP countdown
  useEffect(() => {
    if (otpTimer <= 0) return
    const t = setTimeout(() => setOtpTimer(n => n - 1), 1000)
    return () => clearTimeout(t)
  }, [otpTimer])

  // If already authenticated redirect to home — but ONLY on first mount
  // (not on every render, to avoid redirect loop while filling form)
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/home")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — only fires on mount

  function clearFeedback() { setError(""); setSuccess(""); setFieldErrors({}) }

  // ─── Google Sign In ────────────────────────────────────────────────────
  const handleGoogle = useCallback(async () => {
    clearFeedback()
    if (!isSupabaseReady()) {
      setError("Supabase is not configured yet. Add your credentials in lib/supabase.ts")
      return
    }
    setGLoading(true)
    // This triggers a browser redirect — if it returns, something went wrong
    await auth.signInWithGoogle()
    setGLoading(false)
    setError("Google sign-in failed to open. Check Supabase OAuth settings.")
  }, [])

  // ─── Sign In ───────────────────────────────────────────────────────────
  const handleSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    clearFeedback()
    const errs: Record<string, string> = {}
    if (!siEmail) errs.siEmail = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(siEmail)) errs.siEmail = "Invalid email"
    if (!siPassword) errs.siPassword = "Password is required"
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    if (!isSupabaseReady()) { setError("Supabase is not configured. Add credentials in lib/supabase.ts"); return }

    setLoading(true)
    const { user, error: err } = await auth.signIn(siEmail, siPassword)
    setLoading(false)
    if (err) { setError(err); return }
    if (user) {
      setUser(user)
      if (user.role === "company_owner" || user.role === "company_manager") {
        const comp = await companies.getByOwner(user.id)
        if (comp) setCompany(comp)
      }
      router.push(user.role === "salesman" || user.role === "viewer" ? "/2home" : "/home")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siEmail, siPassword])

  // ─── Sign-up Step 1 validation ─────────────────────────────────────────
  function validateStep1(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!suEmail) errs.suEmail = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(suEmail)) errs.suEmail = "Invalid email"
    if (!suPassword) errs.suPassword = "Password is required"
    else if (suPassword.length < 8) errs.suPassword = "At least 8 characters"
    if (suPassword !== suConfirm) errs.suConfirm = "Passwords do not match"
    if (!suAgreed) errs.suAgreed = "You must accept the Terms"
    return errs
  }

  function handleNextStep() {
    clearFeedback()
    const errs = validateStep1()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    if (!isSupabaseReady()) { setError("Supabase is not configured. Add credentials in lib/supabase.ts"); return }
    setStep("company")
  }

  // ─── Sign Up (full company details) ───────────────────────────────────
  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    clearFeedback()
    const errs: Record<string, string> = {}
    if (!coName) errs.coName = "Company name is required"
    if (!ceoName) errs.ceoName = "Your name is required"
    if (!coCountry) errs.coCountry = "Country is required"
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    setLoading(true)
    const { user, error: err } = await auth.signUp(suEmail, suPassword, selectedRole ?? "company_owner")
    if (err) { setError(err); setLoading(false); return }
    if (user) {
      setUser(user)
      const { company } = await companies.create({
        owner_id: user.id,
        name: coName,
        ceo_name: ceoName,
        phone: coPhone,
        country: coCountry,
        industry: coIndustry || undefined,
        logo_url: "/default-avatar.jpg",
        subscription_plan: "starter",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      if (company) setCompany(company)
      setStep("verify")
    }
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suEmail, suPassword, coName, ceoName, coPhone, coCountry, coIndustry, selectedRole])

  // ─── Quick Start / Fill Later ──────────────────────────────────────────
  const handleFillLater = useCallback(async () => {
    clearFeedback()
    const errs = validateStep1()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    if (!isSupabaseReady()) { setError("Supabase is not configured. Add credentials in lib/supabase.ts"); return }

    setLoading(true)
    const { user, error: err } = await auth.signUp(suEmail, suPassword, selectedRole ?? "company_owner")
    if (err) { setError(err); setLoading(false); return }
    if (user) {
      setUser(user)
      const guestName = generateGuestName()
      const { company } = await companies.create({
        owner_id: user.id,
        name: guestName,
        logo_url: "/default-avatar.jpg",
        subscription_plan: "starter",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      if (company) setCompany(company)
      setSuccess("Account created! Complete your profile in Settings anytime.")
      setTimeout(() => router.push("/home"), 1200)
    }
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suEmail, suPassword, selectedRole])

  // ─── Forgot PW ────────────────────────────────────────────────────────
  const handleForgot = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); clearFeedback()
    if (!fpEmail) { setError("Enter your email"); return }
    if (!isSupabaseReady()) { setError("Supabase not configured"); return }
    setLoading(true)
    const { error: err } = await auth.resetPassword(fpEmail)
    setLoading(false)
    if (err) { setError(err); return }
    setSuccess("Check your email for the 6-digit code.")
    setView("otp"); setOtpTimer(60)
  }, [fpEmail])

  const handleVerifyOTP = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); clearFeedback()
    if (otp.length < 6) { setError("Enter the full 6-digit code"); return }
    setLoading(true)
    const { valid, error: err } = await auth.verifyOTP(fpEmail, otp)
    setLoading(false)
    if (err || !valid) { setError(err ?? "Invalid code"); return }
    setView("reset")
  }, [otp, fpEmail])

  const handleReset = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); clearFeedback()
    if (newPw !== confirmNewPw) { setError("Passwords do not match"); return }
    if (newPw.length < 8) { setError("At least 8 characters"); return }
    setLoading(true)
    const { error: err } = await auth.updatePassword(newPw)
    setLoading(false)
    if (err) { setError(err); return }
    setSuccess("Password updated! Sign in below.")
    setView("main"); setTab("signin")
  }, [newPw, confirmNewPw])

  // ─── pw strength display ───────────────────────────────────────────────
  const pw = pwStrength(suPassword)

  // ─── Feedback blocks ──────────────────────────────────────────────────
  const Feedback = () => (
    <>
      {error && (
        <div className="flex items-start gap-2 p-2.5 border-2 border-destructive bg-destructive/8 text-destructive text-xs font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 p-2.5 border-2 border-green-600 bg-green-50 text-green-700 text-xs font-medium">
          <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{success}
        </div>
      )}
    </>
  )

  // ─── Sub-views: Forgot / OTP / Reset ─────────────────────────────────
  if (view === "forgot") return (
    <Shell onBack={() => setView("main")}>
      <form onSubmit={handleForgot} className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-black">Reset Password</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{"We'll send a 6-digit code to your email."}</p>
        </div>
        <Feedback />
        <Field label="Email" id="fp-email" type="email" value={fpEmail} onChange={setFpEmail}
          placeholder="you@company.com" required icon={Mail} autoComplete="email" />
        <Btn type="submit" loading={loading}>Send Code <ArrowRight className="w-3.5 h-3.5" /></Btn>
      </form>
    </Shell>
  )

  if (view === "otp") return (
    <Shell onBack={() => setView("forgot")}>
      <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-black">Enter Code</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Sent to <strong>{fpEmail}</strong></p>
        </div>
        <Feedback />
        <OTPInput value={otp} onChange={setOtp} />
        <div className="text-center">
          {otpTimer > 0
            ? <p className="text-xs text-muted-foreground">Resend in {otpTimer}s</p>
            : <button type="button" onClick={() => { auth.resetPassword(fpEmail); setOtpTimer(60) }}
                className="text-xs text-primary font-bold hover:underline">Resend Code</button>}
        </div>
        <Btn type="submit" loading={loading}>Verify</Btn>
      </form>
    </Shell>
  )

  if (view === "reset") return (
    <Shell onBack={() => setView("otp")}>
      <form onSubmit={handleReset} className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-black">New Password</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Minimum 8 characters required.</p>
        </div>
        <Feedback />
        <Field label="New Password" id="new-pw" type="password" value={newPw} onChange={setNewPw}
          placeholder="••••••••" required icon={Lock} />
        <Field label="Confirm Password" id="confirm-pw" type="password" value={confirmNewPw}
          onChange={setConfirmNewPw} placeholder="••••••••" required icon={Lock}
          error={confirmNewPw && newPw !== confirmNewPw ? "Does not match" : undefined} />
        <Btn type="submit" loading={loading}>Update Password</Btn>
      </form>
    </Shell>
  )

  // ─── Sign-up verify step ──────────────────────────────────────────────
  if (tab === "signup" && step === "verify") return (
    <Shell onBack={() => { setTab("signin"); setStep("account") }}>
      <div className="flex flex-col items-center gap-4 text-center py-2">
        <div className="w-14 h-14 bg-green-100 border-2 border-green-600 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-green-600" />
        </div>
        <div>
          <h2 className="text-lg font-black">Verify Your Email</h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            We sent a confirmation link to <strong className="text-foreground">{suEmail}</strong>.<br />
            Click the link to activate your account, then sign in.
          </p>
        </div>
        <Btn onClick={() => { setTab("signin"); setStep("account") }} variant="primary">
          Go to Sign In <ArrowRight className="w-3.5 h-3.5" />
        </Btn>
        <p className="text-[11px] text-muted-foreground">
          Didn&apos;t get it?{" "}
          <button className="text-primary font-bold hover:underline"
            onClick={() => auth.resetPassword(suEmail)}>Resend</button>
        </p>
      </div>
    </Shell>
  )

  // ─── Step indicators ──────────────────────────────────────────────────
  function StepDots({ current }: { current: 0 | 1 }) {
    return (
      <div className="flex items-center gap-1.5 mb-1">
        {[["1", "Account"], ["2", "Company"], ["3", "Done"]].map(([n, l], i) => (
          <div key={n} className="flex items-center gap-1">
            <div className={cn(
              "w-5 h-5 flex items-center justify-center text-[10px] font-black border-2",
              i < current ? "bg-green-500 border-green-600 text-white"
              : i === current ? "bg-primary text-primary-foreground border-foreground"
              : "border-foreground/20 text-muted-foreground"
            )}>
              {i < current ? "✓" : n}
            </div>
            <span className={cn(
              "text-[10px] font-medium",
              i === current ? "text-foreground" : "text-muted-foreground/50"
            )}>{l}</span>
            {i < 2 && <div className="w-3 h-px bg-foreground/20 mx-0.5" />}
          </div>
        ))}
      </div>
    )
  }

  // ─── Google button (shared) ───────────────────────────────────────────
  const GoogleBtn = () => (
    <Btn variant="secondary" loading={gLoading} onClick={handleGoogle}>
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </Btn>
  )

  // ─── MAIN RENDER ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b-2 border-foreground/20">
        <button
          onClick={() => router.push("/")}
          className="p-1.5 border-2 border-foreground/20 hover:border-foreground active:translate-x-[1px] active:translate-y-[1px] transition-all duration-75"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex flex-col">
          <span className="text-sm font-black golden-text tracking-widest">BIZLINK</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {selectedRole === "company_manager" ? "Company Manager" : "Company Owner"}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Secure</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start p-4 pt-5 gap-4">
        {/* Compact logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary border-2 border-foreground shadow-[2px_2px_0px_0px] shadow-foreground flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-black text-base">G</span>
          </div>
          <div>
            <p className="text-xs font-black leading-none">GOLDEN techS</p>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">B2B Business Network</p>
          </div>
        </div>

        {/* Main card */}
        <div className="w-full max-w-sm bg-card border-2 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
          {/* Tab bar */}
          <div className="flex border-b-2 border-foreground/20">
            {(["signin", "signup"] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setStep("account"); clearFeedback() }}
                className={cn(
                  "flex-1 py-2.5 text-xs font-black uppercase tracking-widest",
                  "transition-colors duration-75 active:scale-95",
                  tab === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div className="p-4 flex flex-col gap-3.5">
            {/* ── SIGN IN ── */}
            {tab === "signin" && (
              <form onSubmit={handleSignIn} className="flex flex-col gap-3">
                <Feedback />
                <Field label="Email" id="si-email" type="email" value={siEmail} onChange={setSiEmail}
                  placeholder="you@company.com" required icon={Mail} autoComplete="email"
                  error={fieldErrors.siEmail} />
                <Field label="Password" id="si-pw" type="password" value={siPassword}
                  onChange={setSiPassword} placeholder="••••••••••" required icon={Lock}
                  autoComplete="current-password" error={fieldErrors.siPassword} />
                <button
                  type="button"
                  onClick={() => { setFpEmail(siEmail); setView("forgot") }}
                  className="self-end text-[11px] text-primary font-bold hover:underline active:opacity-70 transition-opacity duration-75 -mt-1"
                >
                  Forgot password?
                </button>
                <Btn type="submit" loading={loading}>
                  Sign In <ArrowRight className="w-3.5 h-3.5" />
                </Btn>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-foreground/10" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-foreground/10" />
                </div>
                <GoogleBtn />
              </form>
            )}

            {/* ── SIGN UP Step 1: Account ── */}
            {tab === "signup" && step === "account" && (
              <div className="flex flex-col gap-3">
                <StepDots current={0} />
                <Feedback />
                <Field label="Email" id="su-email" type="email" value={suEmail} onChange={setSuEmail}
                  placeholder="you@company.com" required icon={Mail} autoComplete="email"
                  error={fieldErrors.suEmail} />
                <div>
                  <Field label="Password" id="su-pw" type="password" value={suPassword}
                    onChange={setSuPassword} placeholder="Min 8 characters" required icon={Lock}
                    autoComplete="new-password" error={fieldErrors.suPassword} />
                  {suPassword.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={cn("flex-1 h-1 rounded-full transition-all duration-200",
                          i <= pw.score ? pw.cls : "bg-muted")} />
                      ))}
                      <span className="text-[10px] text-muted-foreground w-16 text-right">{pw.label}</span>
                    </div>
                  )}
                </div>
                <Field label="Confirm Password" id="su-confirm" type="password" value={suConfirm}
                  onChange={setSuConfirm} placeholder="Re-enter password" required icon={Lock}
                  autoComplete="new-password" error={fieldErrors.suConfirm} />
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={suAgreed} onChange={e => setSuAgreed(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 accent-primary shrink-0" />
                  <span className="text-[11px] text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <a href="/terms" target="_blank" className="text-primary font-bold hover:underline">Terms</a>
                    {" & "}
                    <a href="/privacy" target="_blank" className="text-primary font-bold hover:underline">Privacy Policy</a>
                  </span>
                </label>
                {fieldErrors.suAgreed && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{fieldErrors.suAgreed}
                  </p>
                )}

                <Btn onClick={handleNextStep}>
                  Continue <ChevronRight className="w-3.5 h-3.5" />
                </Btn>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-foreground/10" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-foreground/10" />
                </div>
                <GoogleBtn />
              </div>
            )}

            {/* ── SIGN UP Step 2: Company details ── */}
            {tab === "signup" && step === "company" && (
              <form onSubmit={handleSignUp} className="flex flex-col gap-3">
                <StepDots current={1} />
                <Feedback />

                <Field label="Company Name" id="co-name" value={coName} onChange={setCoName}
                  placeholder="Acme Industries Ltd." required icon={Building2} error={fieldErrors.coName} />
                <Field label="Your Full Name (CEO / Owner)" id="ceo-name" value={ceoName}
                  onChange={setCeoName} placeholder="Full name" required icon={User} error={fieldErrors.ceoName} />
                <Field label="Phone" id="co-phone" type="tel" value={coPhone} onChange={setCoPhone}
                  placeholder="+91 98765 43210" icon={Phone} />
                <Field label="Country" id="co-country" value={coCountry} onChange={setCoCountry}
                  placeholder="e.g. India" required error={fieldErrors.coCountry} />
                <Field label="Industry" id="co-industry" value={coIndustry} onChange={setCoIndustry}
                  placeholder="e.g. Manufacturing" />

                <p className="text-[11px] text-muted-foreground leading-relaxed -mt-1">
                  Logo, address, and other details can be added in Settings after sign-up.
                </p>

                <div className="flex gap-2">
                  <Btn variant="secondary" onClick={() => setStep("account")} className="flex-1">
                    Back
                  </Btn>
                  <Btn type="submit" loading={loading} className="flex-1">
                    Create Account
                  </Btn>
                </div>

                {/* Quick Start button */}
                <button
                  type="button"
                  onClick={handleFillLater}
                  disabled={loading}
                  className={cn(
                    "w-full flex items-center justify-center gap-1.5 py-2 px-4",
                    "text-[11px] font-bold uppercase tracking-widest",
                    "border-2 border-dashed border-foreground/30 text-muted-foreground",
                    "hover:border-foreground hover:text-foreground transition-all duration-75",
                    "active:translate-x-[1px] active:translate-y-[1px]",
                    "disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  <Zap className="w-3 h-3" />
                  Quick Start — Fill Details Later
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center max-w-xs">
          Powered by{" "}
          <span className="font-black text-primary">GOLDEN</span>
          <span className="font-bold">techS</span>
          {" · "}All data is end-to-end secured.
        </p>
      </main>
    </div>
  )
}
