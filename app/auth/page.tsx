"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Chrome, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/db"
import { useAppStore } from "@/lib/store"
import { isSupabaseReady } from "@/lib/supabase"

type Tab = "signin" | "signup"
type Step = "account" | "company" | "verify"

// ─── Password strength ─────────────────────
function strength(pw: string): { score: number; label: string; color: string } {
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  const map = [
    { score: 0, label: "", color: "" },
    { score: 1, label: "Weak", color: "bg-red-500" },
    { score: 2, label: "Fair", color: "bg-orange-400" },
    { score: 3, label: "Good", color: "bg-yellow-400" },
    { score: 4, label: "Strong", color: "bg-green-500" },
    { score: 5, label: "Very Strong", color: "bg-green-600" },
  ]
  return map[s] ?? map[0]
}

// ─── Input ─────────────────────────────────
function Field({
  label, id, type = "text", value, onChange, placeholder, required, icon: Icon, suffix, error,
}: {
  label: string; id: string; type?: string; value: string
  onChange: (v: string) => void; placeholder?: string; required?: boolean
  icon?: React.ElementType; suffix?: React.ReactNode; error?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] font-bold uppercase tracking-widest text-foreground/70">
        {label}{required && <span className="text-primary ml-0.5">*</span>}
      </label>
      <div className={cn("flex items-center border-2 bg-card transition-colors",
        error ? "border-destructive" : "border-foreground/40 focus-within:border-primary")}>
        {Icon && <Icon className="w-4 h-4 ml-3 text-muted-foreground shrink-0" />}
        <input
          id={id} type={type} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder} required={required}
          className="flex-1 px-3 py-2.5 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
        />
        {suffix}
      </div>
      {error && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

// ─── Password field with show/hide ─────────
function PasswordField({ label, id, value, onChange, showMeter, error }: {
  label: string; id: string; value: string
  onChange: (v: string) => void; showMeter?: boolean; error?: string
}) {
  const [show, setShow] = useState(false)
  const pw = strength(value)
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] font-bold uppercase tracking-widest text-foreground/70">
        {label}<span className="text-primary ml-0.5">*</span>
      </label>
      <div className={cn("flex items-center border-2 bg-card transition-colors",
        error ? "border-destructive" : "border-foreground/40 focus-within:border-primary")}>
        <Lock className="w-4 h-4 ml-3 text-muted-foreground shrink-0" />
        <input id={id} type={show ? "text" : "password"} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="••••••••••••"
          className="flex-1 px-3 py-2.5 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40" />
        <button type="button" onClick={() => setShow(s => !s)}
          className="px-3 text-muted-foreground hover:text-foreground transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {showMeter && value.length > 0 && (
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex-1 h-1 bg-muted flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={cn("flex-1 transition-colors", i <= pw.score ? pw.color : "bg-muted")} />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground w-16">{pw.label}</span>
        </div>
      )}
      {error && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

// ─── Btn ────────────────────────────────────
function Btn({ children, onClick, type = "button", loading, variant = "primary", className }: {
  children: React.ReactNode; onClick?: () => void; type?: "button" | "submit"
  loading?: boolean; variant?: "primary" | "ghost" | "google"; className?: string
}) {
  const base = "relative w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold uppercase tracking-wide border-2 transition-all duration-75 select-none disabled:opacity-50 active:translate-x-[1px] active:translate-y-[1px]"
  const variants = {
    primary: "bg-primary text-primary-foreground border-foreground shadow-[3px_3px_0px_0px] shadow-foreground hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px]",
    ghost: "bg-transparent text-foreground border-foreground/30 hover:border-foreground",
    google: "bg-white text-gray-800 border-foreground shadow-[3px_3px_0px_0px] shadow-foreground hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px]",
  }
  return (
    <button type={type} disabled={loading} onClick={onClick} className={cn(base, variants[variant], className)}>
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Please wait...
        </span>
      ) : children}
    </button>
  )
}

// ─── OTP input ──────────────────────────────
function OTPBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = value.split("")
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input key={i}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i] ?? ""}
          onChange={e => {
            const d = e.target.value.replace(/\D/, "")
            const arr = value.split("")
            arr[i] = d
            onChange(arr.join("").slice(0, 6))
            if (d && i < 5) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus()
          }}
          onKeyDown={e => {
            if (e.key === "Backspace" && !digits[i] && i > 0)
              (document.getElementById(`otp-${i - 1}`) as HTMLInputElement)?.focus()
          }}
          id={`otp-${i}`}
          className="w-11 h-12 text-center text-lg font-bold border-2 border-foreground/40 bg-card focus:border-primary outline-none transition-colors"
        />
      ))}
    </div>
  )
}

// ════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════
export default function AuthPage() {
  const router = useRouter()
  const { selectedRole, setUser, isAuthenticated } = useAppStore()

  const [tab, setTab] = useState<Tab>("signin")
  const [step, setStep] = useState<Step>("account")

  // Sign-in fields
  const [siEmail, setSiEmail] = useState("")
  const [siPassword, setSiPassword] = useState("")

  // Sign-up Step 1
  const [suEmail, setSuEmail] = useState("")
  const [suPassword, setSuPassword] = useState("")
  const [suConfirm, setSuConfirm] = useState("")
  const [suAgreed, setSuAgreed] = useState(false)

  // Sign-up Step 2 (company)
  const [coName, setCoName] = useState("")
  const [ceoName, setCeoName] = useState("")
  const [coPhone, setCoPhone] = useState("")
  const [coCountry, setCoCountry] = useState("")
  const [coIndustry, setCoIndustry] = useState("")

  // Forgot / OTP / Reset
  const [view, setView] = useState<"main" | "forgot" | "otp" | "reset">("main")
  const [fpEmail, setFpEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmNewPw, setConfirmNewPw] = useState("")
  const [otpTimer, setOtpTimer] = useState(0)

  // UI state
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Redirect if already authed
  useEffect(() => {
    if (isAuthenticated) router.replace("/home")
  }, [isAuthenticated, router])

  useEffect(() => {
    if (!selectedRole) router.replace("/")
  }, [selectedRole, router])

  // OTP countdown
  useEffect(() => {
    if (otpTimer <= 0) return
    const t = setTimeout(() => setOtpTimer(n => n - 1), 1000)
    return () => clearTimeout(t)
  }, [otpTimer])

  // ─── Sign In ────────────────────────────
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError(""); setSuccess("")
    const errs: Record<string, string> = {}
    if (!siEmail) errs.siEmail = "Email is required"
    if (!siPassword) errs.siPassword = "Password is required"
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setFieldErrors({})

    if (!isSupabaseReady()) {
      setError("🟢🟢 Supabase is not configured. Add your URL & Anon Key in lib/supabase.ts 🟢🟢")
      return
    }

    setLoading(true)
    const { user, error: err } = await auth.signIn(siEmail, siPassword)
    setLoading(false)
    if (err) { setError(err); return }
    if (user) { setUser(user); router.push("/home") }
  }

  // ─── Google ─────────────────────────────
  async function handleGoogle() {
    setError(""); setGLoading(true)
    if (!isSupabaseReady()) {
      setError("🟢🟢 Supabase is not configured. Add your URL & Anon Key in lib/supabase.ts 🟢🟢")
      setGLoading(false); return
    }
    // This redirects the browser — no user returned synchronously
    await auth.signInWithGoogle()
    // If we reach here, something went wrong (otherwise browser navigated away)
    setGLoading(false)
    setError("Google sign-in did not open. Check your Supabase OAuth settings.")
  }

  // ─── Sign Up Step 1 validation ──────────
  function validateStep1() {
    const errs: Record<string, string> = {}
    if (!suEmail) errs.suEmail = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(suEmail)) errs.suEmail = "Invalid email"
    if (!suPassword) errs.suPassword = "Password is required"
    else if (suPassword.length < 8) errs.suPassword = "At least 8 characters"
    if (suPassword !== suConfirm) errs.suConfirm = "Passwords do not match"
    if (!suAgreed) errs.suAgreed = "You must agree to the Terms"
    return errs
  }

  function handleNextStep() {
    setError("")
    const errs = validateStep1()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setFieldErrors({})
    setStep("company")
  }

  // ─── Sign Up Step 2 submit ───────────────
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const errs: Record<string, string> = {}
    if (!coName) errs.coName = "Company name is required"
    if (!ceoName) errs.ceoName = "CEO name is required"
    if (!coCountry) errs.coCountry = "Country is required"
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setFieldErrors({})

    if (!isSupabaseReady()) {
      setError("🟢🟢 Supabase is not configured. Add your URL & Anon Key in lib/supabase.ts 🟢🟢")
      return
    }

    setLoading(true)
    const { user, error: err } = await auth.signUp(suEmail, suPassword, selectedRole ?? "company_owner")
    setLoading(false)
    if (err) { setError(err); return }
    if (user) {
      setUser(user)
      // Company creation happens in home/profile after verification
      setStep("verify")
    }
  }

  // ─── Forgot PW ──────────────────────────
  async function handleForgot(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSuccess("")
    if (!fpEmail) { setError("Enter your email"); return }
    if (!isSupabaseReady()) { setError("🟢🟢 Supabase not configured 🟢🟢"); return }
    setLoading(true)
    const { error: err } = await auth.resetPassword(fpEmail)
    setLoading(false)
    if (err) { setError(err); return }
    setView("otp"); setOtpTimer(60)
    setSuccess("Check your email for the verification code.")
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault(); setError("")
    if (otp.length < 6) { setError("Enter the 6-digit code"); return }
    setLoading(true)
    const { valid, error: err } = await auth.verifyOTP(fpEmail, otp)
    setLoading(false)
    if (err || !valid) { setError(err ?? "Invalid code"); return }
    setView("reset")
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault(); setError("")
    if (newPw !== confirmNewPw) { setError("Passwords do not match"); return }
    if (newPw.length < 8) { setError("At least 8 characters"); return }
    setLoading(true)
    const { error: err } = await auth.updatePassword(newPw)
    setLoading(false)
    if (err) { setError(err); return }
    setSuccess("Password updated! Sign in below.")
    setView("main"); setTab("signin")
  }

  // ─── Role label ─────────────────────────
  const roleLabel = selectedRole === "company_manager" ? "Company Manager" : "Company Owner"

  // ════ RENDER HELPERS ═══════════════════
  function renderError() {
    return error ? (
      <div className="flex items-start gap-2 p-3 border-2 border-destructive bg-destructive/8 text-destructive text-sm">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    ) : null
  }

  function renderSuccess() {
    return success ? (
      <div className="flex items-start gap-2 p-3 border-2 border-green-600 bg-green-50 text-green-700 text-sm">
        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{success}</span>
      </div>
    ) : null
  }

  // ─── Forgot / OTP / Reset sub-views ─────
  if (view === "forgot") return (
    <Shell>
      <form onSubmit={handleForgot} className="flex flex-col gap-4">
        <button type="button" onClick={() => setView("main")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </button>
        <div>
          <h2 className="text-xl font-black">Reset Password</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{"We'll email you a 6-digit code."}</p>
        </div>
        {renderError()}{renderSuccess()}
        <Field label="Email" id="fp-email" type="email" value={fpEmail} onChange={setFpEmail}
          placeholder="you@company.com" required icon={Mail} />
        <Btn type="submit" loading={loading} variant="primary">Send Code</Btn>
      </form>
    </Shell>
  )

  if (view === "otp") return (
    <Shell>
      <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
        <button type="button" onClick={() => setView("forgot")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div>
          <h2 className="text-xl font-black">Enter Code</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Sent to <strong>{fpEmail}</strong></p>
        </div>
        {renderError()}{renderSuccess()}
        <OTPBox value={otp} onChange={setOtp} />
        {otpTimer > 0
          ? <p className="text-center text-xs text-muted-foreground">Resend in {otpTimer}s</p>
          : <button type="button" onClick={() => { auth.resetPassword(fpEmail); setOtpTimer(60) }}
              className="text-center text-xs text-primary font-bold hover:underline">Resend Code</button>}
        <Btn type="submit" loading={loading} variant="primary">Verify</Btn>
      </form>
    </Shell>
  )

  if (view === "reset") return (
    <Shell>
      <form onSubmit={handleReset} className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-black">New Password</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Minimum 8 characters.</p>
        </div>
        {renderError()}
        <PasswordField label="New Password" id="new-pw" value={newPw} onChange={setNewPw} showMeter />
        <PasswordField label="Confirm Password" id="confirm-pw" value={confirmNewPw} onChange={setConfirmNewPw}
          error={confirmNewPw && newPw !== confirmNewPw ? "Does not match" : undefined} />
        <Btn type="submit" loading={loading} variant="primary">Update Password</Btn>
      </form>
    </Shell>
  )

  // Sign-up verify step
  if (tab === "signup" && step === "verify") return (
    <Shell>
      <div className="flex flex-col gap-4 text-center">
        <div className="w-14 h-14 bg-green-100 border-2 border-green-500 flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-black">Check Your Email</h2>
          <p className="text-sm text-muted-foreground mt-1">
            We sent a confirmation link to <strong>{suEmail}</strong>.<br />
            Click it to verify, then come back to sign in.
          </p>
        </div>
        <Btn onClick={() => { setTab("signin"); setStep("account"); setView("main") }} variant="primary">
          Go to Sign In
        </Btn>
      </div>
    </Shell>
  )

  // ─── MAIN SIGN-IN / SIGN-UP ─────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Tiny top bar */}
      <header className="flex items-center gap-3 px-4 py-3 border-b-2 border-foreground/20">
        <button onClick={() => router.push("/")} className="p-1.5 border-2 border-foreground/30 hover:border-foreground active:bg-accent transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex flex-col">
          <span className="text-sm font-black leading-none golden-text">BIZLINK</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{roleLabel}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start p-4 pt-6 gap-5">
        {/* Logo block */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-primary border-2 border-foreground shadow-[3px_3px_0px_0px] shadow-foreground flex items-center justify-center">
            <span className="text-primary-foreground font-black text-lg">G</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium">by Golden techS</p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-card border-2 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
          {/* Tabs */}
          <div className="flex border-b-2 border-foreground/20">
            {(["signin", "signup"] as Tab[]).map(t => (
              <button key={t} type="button"
                onClick={() => { setTab(t); setStep("account"); setError(""); setFieldErrors({}) }}
                className={cn("flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors",
                  tab === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}>
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* ── SIGN IN ── */}
            {tab === "signin" && (
              <form onSubmit={handleSignIn} className="flex flex-col gap-3.5">
                {renderError()}
                <Field label="Email" id="si-email" type="email" value={siEmail}
                  onChange={setSiEmail} placeholder="you@company.com" required icon={Mail}
                  error={fieldErrors.siEmail} />
                <PasswordField label="Password" id="si-pw" value={siPassword} onChange={setSiPassword}
                  error={fieldErrors.siPassword} />
                <button type="button" onClick={() => { setView("forgot"); setFpEmail(siEmail) }}
                  className="self-end text-[11px] text-primary font-bold hover:underline -mt-1">
                  Forgot password?
                </button>
                <Btn type="submit" loading={loading} variant="primary">Sign In</Btn>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-foreground/15" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-foreground/15" />
                </div>
                <Btn variant="google" loading={gLoading} onClick={handleGoogle}>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Btn>
              </form>
            )}

            {/* ── SIGN UP Step 1: Account ── */}
            {tab === "signup" && step === "account" && (
              <div className="flex flex-col gap-3.5">
                {/* Step indicator */}
                <div className="flex items-center gap-1 mb-1">
                  {[["1","Account"],["2","Company"],["3","Done"]].map(([n, l], i) => (
                    <div key={n} className="flex items-center gap-1">
                      <div className={cn("w-5 h-5 flex items-center justify-center text-[10px] font-black border-2",
                        i === 0 ? "bg-primary text-primary-foreground border-foreground" : "border-foreground/30 text-muted-foreground")}>
                        {n}
                      </div>
                      <span className={cn("text-[10px] font-medium", i === 0 ? "text-foreground" : "text-muted-foreground/50")}>{l}</span>
                      {i < 2 && <div className="w-4 h-px bg-foreground/20 mx-0.5" />}
                    </div>
                  ))}
                </div>

                {renderError()}
                <Field label="Email" id="su-email" type="email" value={suEmail} onChange={setSuEmail}
                  placeholder="you@company.com" required icon={Mail} error={fieldErrors.suEmail} />
                <PasswordField label="Password" id="su-pw" value={suPassword} onChange={setSuPassword} showMeter
                  error={fieldErrors.suPassword} />
                <PasswordField label="Confirm Password" id="su-confirm" value={suConfirm} onChange={setSuConfirm}
                  error={fieldErrors.suConfirm} />

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={suAgreed} onChange={e => setSuAgreed(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 accent-primary" />
                  <span className="text-[11px] text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <a href="/terms" target="_blank" className="text-primary font-bold hover:underline">Terms</a>
                    {" & "}
                    <a href="/privacy" target="_blank" className="text-primary font-bold hover:underline">Privacy Policy</a>
                  </span>
                </label>
                {fieldErrors.suAgreed && <p className="text-[11px] text-destructive">{fieldErrors.suAgreed}</p>}

                <Btn onClick={handleNextStep} variant="primary">Continue</Btn>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-foreground/15" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-foreground/15" />
                </div>
                <Btn variant="google" loading={gLoading} onClick={handleGoogle}>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </Btn>
              </div>
            )}

            {/* ── SIGN UP Step 2: Company ── */}
            {tab === "signup" && step === "company" && (
              <form onSubmit={handleSignUp} className="flex flex-col gap-3.5">
                <div className="flex items-center gap-1 mb-1">
                  {[["1","Account"],["2","Company"],["3","Done"]].map(([n, l], i) => (
                    <div key={n} className="flex items-center gap-1">
                      <div className={cn("w-5 h-5 flex items-center justify-center text-[10px] font-black border-2",
                        i === 1 ? "bg-primary text-primary-foreground border-foreground"
                          : i === 0 ? "bg-green-500 border-green-600 text-white"
                          : "border-foreground/30 text-muted-foreground")}>
                        {i === 0 ? "✓" : n}
                      </div>
                      <span className={cn("text-[10px] font-medium", i === 1 ? "text-foreground" : "text-muted-foreground/50")}>{l}</span>
                      {i < 2 && <div className="w-4 h-px bg-foreground/20 mx-0.5" />}
                    </div>
                  ))}
                </div>

                {renderError()}

                <Field label="Company Name" id="co-name" value={coName} onChange={setCoName}
                  placeholder="Acme Industries" required error={fieldErrors.coName} />
                <Field label="CEO / Owner Name" id="ceo-name" value={ceoName} onChange={setCeoName}
                  placeholder="Full name" required error={fieldErrors.ceoName} />
                <Field label="Phone" id="co-phone" type="tel" value={coPhone} onChange={setCoPhone}
                  placeholder="+91 98765 43210" />
                <Field label="Country" id="co-country" value={coCountry} onChange={setCoCountry}
                  placeholder="e.g. India" required error={fieldErrors.coCountry} />
                <Field label="Industry" id="co-industry" value={coIndustry} onChange={setCoIndustry}
                  placeholder="e.g. Manufacturing" />

                <p className="text-[10px] text-muted-foreground -mt-1">
                  You can add your logo, address, and more details in your profile after signing up.
                </p>

                <div className="flex gap-2">
                  <Btn variant="ghost" onClick={() => setStep("account")} className="flex-1">Back</Btn>
                  <Btn type="submit" loading={loading} variant="primary" className="flex-1">Create Account</Btn>
                </div>
              </form>
            )}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center max-w-xs">
          By continuing you agree to our{" "}
          <a href="/terms" className="text-primary font-bold hover:underline">Terms</a>
          {" & "}
          <a href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</a>
        </p>
      </main>
    </div>
  )
}

// ─── Shared shell for sub-views ──────────
function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-3 px-4 py-3 border-b-2 border-foreground/20">
        <button onClick={() => router.push("/")} className="p-1.5 border-2 border-foreground/30 hover:border-foreground transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-black golden-text">BIZLINK</span>
      </header>
      <main className="flex-1 flex items-start justify-center p-4 pt-10">
        <div className="w-full max-w-sm bg-card border-2 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground p-5">
          {children}
        </div>
      </main>
    </div>
  )
}
