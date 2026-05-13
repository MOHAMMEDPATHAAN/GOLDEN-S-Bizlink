'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SplashScreen } from '@/components/splash-screen'
import { RoleSelector } from '@/components/role-selector'
import { useAppStore, applyTheme } from '@/lib/store'
import { auth, appState } from '@/lib/db'
import type { UserRole } from '@/lib/types'

type AppState = 'splash' | 'role_select' | 'redirecting'

export default function IndexPage() {
  const router = useRouter()
  const { 
    isAuthenticated, 
    selectedRole, 
    setSelectedRole, 
    showSplash, 
    setShowSplash,
    theme,
    setUser
  } = useAppStore()
  
  const [appStateLocal, setAppStateLocal] = useState<AppState>('splash')

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { user } = await auth.getSession()
      if (user) {
        setUser(user)
      }
    }
    checkSession()
    
    // Apply theme
    applyTheme(theme)
  }, [theme, setUser])

  // Handle splash complete
  const handleSplashComplete = () => {
    setShowSplash(false)
    appState.setSkipSplash(true)
    
    // Check if user already has a role selected and is authenticated
    const storedRole = appState.getSelectedRole()
    if (storedRole && isAuthenticated) {
      // Redirect based on role
      redirectBasedOnRole(storedRole)
    } else if (storedRole) {
      // Has role but not authenticated, go to auth
      setSelectedRole(storedRole)
      redirectToAuth(storedRole)
    } else {
      // Show role selector
      setAppStateLocal('role_select')
    }
  }

  // Handle role selection
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    appState.setSelectedRole(role)
    redirectToAuth(role)
  }

  // Redirect based on role
  const redirectBasedOnRole = (role: UserRole) => {
    setAppStateLocal('redirecting')
    if (role === 'company_owner' || role === 'company_manager') {
      router.push('/home')
    } else {
      router.push('/2home')
    }
  }

  // Redirect to auth page based on role
  const redirectToAuth = (role: UserRole) => {
    setAppStateLocal('redirecting')
    if (role === 'company_owner' || role === 'company_manager') {
      router.push('/auth')
    } else {
      router.push('/2auth')
    }
  }

  // Show splash screen
  if (appStateLocal === 'splash' || showSplash) {
    return (
      <SplashScreen 
        onComplete={handleSplashComplete}
        skipSplash={!showSplash && appState.shouldSkipSplash()}
      />
    )
  }

  // Show role selector
  if (appStateLocal === 'role_select') {
    return <RoleSelector onRoleSelect={handleRoleSelect} />
  }

  // Redirecting state
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-muted" />
          <div className="absolute inset-0 border-4 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
          Redirecting
        </p>
      </div>
    </div>
  )
}
