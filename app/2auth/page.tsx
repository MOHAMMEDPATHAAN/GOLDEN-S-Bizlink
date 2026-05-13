'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Lock, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PasswordInput } from '@/components/password-input'
import { useAppStore } from '@/lib/store'
import { auth } from '@/lib/db'

type AuthView = 'signin' | 'signup'

export default function SalesmanAuthPage() {
  const router = useRouter()
  const { selectedRole, setUser, isAuthenticated } = useAppStore()
  
  const [view, setView] = useState<AuthView>('signin')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/2home')
    }
  }, [isAuthenticated, router])

  // Redirect if no role selected or wrong role
  useEffect(() => {
    if (!selectedRole) {
      router.push('/')
    } else if (selectedRole === 'company_owner' || selectedRole === 'company_manager') {
      router.push('/auth')
    }
  }, [selectedRole, router])

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
        router.push('/2home')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const { user, error: signUpError } = await auth.signUp(email, password, selectedRole || 'viewer')
      if (signUpError) {
        setError(signUpError)
      } else if (user) {
        setUser(user)
        router.push('/2home')
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
        router.push('/2home')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
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

  const renderSignUp = () => (
    <form onSubmit={handleSignUp} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-bold uppercase tracking-wide">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            className="brutalist-input w-full pl-12"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="signup-email" className="block text-sm font-bold uppercase tracking-wide">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            id="signup-email"
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
        <label htmlFor="signup-password" className="block text-sm font-bold uppercase tracking-wide">
          Password
        </label>
        <PasswordInput
          id="signup-password"
          value={password}
          onChange={setPassword}
          placeholder="Min. 8 characters"
          showStrengthMeter
        />
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label htmlFor="signup-confirm" className="block text-sm font-bold uppercase tracking-wide">
          Confirm Password
        </label>
        <PasswordInput
          id="signup-confirm"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter password"
          error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
        />
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
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>

      {/* Sign In Link */}
      <p className="text-center text-sm">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => setView('signin')}
          className="text-primary font-bold hover:underline"
        >
          Sign In
        </button>
      </p>
    </form>
  )

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
              {selectedRole === 'salesman' ? 'Salesman' : 'Viewer'} Portal
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              {view === 'signin' ? 'Welcome Back' : 'Join Bizlink'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {view === 'signin'
                ? 'Sign in to explore products and companies'
                : 'Create an account to start networking'}
            </p>
          </div>

          {/* Auth Form */}
          <div className="brutalist-card p-6 hover:transform-none hover:shadow-[6px_6px_0px_0px]">
            {view === 'signin' ? renderSignIn() : renderSignUp()}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t-4 border-foreground">
        <div className="max-w-md mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-primary font-bold hover:underline">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
