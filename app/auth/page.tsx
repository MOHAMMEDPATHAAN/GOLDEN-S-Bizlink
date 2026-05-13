'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PasswordInput } from '@/components/password-input'
import { OTPInput } from '@/components/otp-input'
import { SignUpForm } from '@/components/signup-form'
import { useAppStore } from '@/lib/store'
import { auth } from '@/lib/db'

type AuthView = 'signin' | 'signup' | 'forgot_password' | 'verify_otp' | 'reset_password'

export default function AuthPage() {
  const router = useRouter()
  const { selectedRole, setUser, isAuthenticated } = useAppStore()
  
  const [view, setView] = useState<AuthView>('signin')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Sign in form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // OTP form
  const [otp, setOtp] = useState('')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpTimer, setOtpTimer] = useState(0)
  
  // New password
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home')
    }
  }, [isAuthenticated, router])

  // Redirect if no role selected
  useEffect(() => {
    if (!selectedRole) {
      router.push('/')
    }
  }, [selectedRole, router])

  // OTP timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpTimer])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { user, error: signInError } = await auth.signIn(email, password)
      if (signInError) {
        setError(signInError)
      } else if (user) {
        setUser(user)
        router.push('/home')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setIsLoading(true)

    try {
      const { user, error: googleError } = await auth.signInWithGoogle()
      if (googleError) {
        setError(googleError)
      } else if (user) {
        setUser(user)
        router.push('/home')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { error: resetError } = await auth.resetPassword(otpEmail)
      if (resetError) {
        setError(resetError)
      } else {
        setView('verify_otp')
        setOtpTimer(60)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { valid } = await auth.verifyOTP(otpEmail, otp)
      if (valid) {
        setView('reset_password')
      } else {
        setError('Invalid OTP. Please try again.')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (otpTimer > 0) return
    
    try {
      await auth.resetPassword(otpEmail)
      setOtpTimer(60)
    } catch {
      setError('Failed to resend OTP')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters')
      return
    }

    setIsLoading(true)

    try {
      const { error: updateError } = await auth.updatePassword(newPassword)
      if (updateError) {
        setError(updateError)
      } else {
        setView('signin')
        setError('')
        // Show success toast in real app
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUpComplete = () => {
    router.push('/home')
  }

  const renderSignIn = () => (
    <form onSubmit={handleSignIn} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-bold uppercase tracking-wide">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="brutalist-input w-full pl-12"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-bold uppercase tracking-wide">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
          <div className="pl-8">
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              className="pl-4"
            />
          </div>
        </div>
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <button
          type="button"
          onClick={() => setView('forgot_password')}
          className="text-sm text-primary font-bold hover:underline"
        >
          Forgot Password?
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 border-4 border-destructive bg-destructive/10 text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="brutalist-btn w-full text-center"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-muted-foreground/30" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-sm text-muted-foreground uppercase">Or</span>
        </div>
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full p-4 border-4 border-foreground bg-white text-foreground font-bold flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px] shadow-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_0px] transition-all"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      {/* Sign Up Link */}
      <p className="text-center text-sm">
        {"Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => setView('signup')}
          className="text-primary font-bold hover:underline"
        >
          Sign Up
        </button>
      </p>
    </form>
  )

  const renderForgotPassword = () => (
    <form onSubmit={handleForgotPassword} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Reset Password</h2>
        <p className="text-muted-foreground mt-2">
          {"Enter your email and we'll send you a verification code"}
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="reset-email" className="block text-sm font-bold uppercase tracking-wide">
          Email
        </label>
        <input
          id="reset-email"
          type="email"
          value={otpEmail}
          onChange={(e) => setOtpEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="brutalist-input w-full"
        />
      </div>

      {error && (
        <div className="p-3 border-4 border-destructive bg-destructive/10 text-destructive font-medium">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="brutalist-btn w-full text-center"
      >
        {isLoading ? 'Sending...' : 'Send OTP'}
      </button>

      <button
        type="button"
        onClick={() => setView('signin')}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        Back to Sign In
      </button>
    </form>
  )

  const renderVerifyOTP = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Enter Verification Code</h2>
        <p className="text-muted-foreground mt-2">
          We sent a code to {otpEmail}
        </p>
      </div>

      <OTPInput
        value={otp}
        onChange={setOtp}
        error={error}
      />

      <button
        type="submit"
        disabled={isLoading || otp.length !== 6}
        className="brutalist-btn w-full text-center"
      >
        {isLoading ? 'Verifying...' : 'Verify'}
      </button>

      <div className="text-center">
        {otpTimer > 0 ? (
          <p className="text-sm text-muted-foreground">
            Resend code in {otpTimer}s
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResendOTP}
            className="text-sm text-primary font-bold hover:underline"
          >
            Resend Code
          </button>
        )}
      </div>
    </form>
  )

  const renderResetPassword = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Create New Password</h2>
        <p className="text-muted-foreground mt-2">
          Your new password must be at least 12 characters
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="new-password" className="block text-sm font-bold uppercase tracking-wide">
          New Password
        </label>
        <PasswordInput
          id="new-password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Enter new password"
          showStrengthMeter
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm-new-password" className="block text-sm font-bold uppercase tracking-wide">
          Confirm Password
        </label>
        <PasswordInput
          id="confirm-new-password"
          value={confirmNewPassword}
          onChange={setConfirmNewPassword}
          placeholder="Confirm new password"
          error={confirmNewPassword && newPassword !== confirmNewPassword ? 'Passwords do not match' : undefined}
        />
      </div>

      {error && (
        <div className="p-3 border-4 border-destructive bg-destructive/10 text-destructive font-medium">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="brutalist-btn w-full text-center"
      >
        {isLoading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )

  // Show sign up form
  if (view === 'signup') {
    return (
      <SignUpForm
        onBack={() => setView('signin')}
        onComplete={handleSignUpComplete}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 border-b-4 border-foreground">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 border-4 border-foreground hover:bg-accent transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black">
              <span className="golden-text">GOLDEN&apos;S</span>{' '}
              <span className="text-foreground">BIZLINK</span>
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {selectedRole === 'company_owner' ? 'Company Owner' : 'Company Manager'} Portal
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Title for Sign In */}
          {view === 'signin' && (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground">Welcome Back</h2>
              <p className="text-muted-foreground mt-2">
                Sign in to your account to continue
              </p>
            </div>
          )}

          {/* Auth Views */}
          <div className={cn(
            'brutalist-card p-6',
            view !== 'signin' && 'hover:transform-none hover:shadow-[6px_6px_0px_0px]'
          )}>
            {view === 'signin' && renderSignIn()}
            {view === 'forgot_password' && renderForgotPassword()}
            {view === 'verify_otp' && renderVerifyOTP()}
            {view === 'reset_password' && renderResetPassword()}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t-4 border-foreground">
        <div className="max-w-md mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-primary font-bold hover:underline">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
