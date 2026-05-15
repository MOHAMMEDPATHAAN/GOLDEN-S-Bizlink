'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SplashScreen } from '@/components/splash-screen'
import { RoleSelector } from '@/components/role-selector'
import { useAppStore, applyTheme } from '@/lib/store'
import { auth, appState } from '@/lib/db'
import type { UserRole } from '@/lib/types'

type PageState = 'splash' | 'role_select' | 'redirecting'

export default function IndexPage() {
  const router = useRouter()
  const {
    isAuthenticated,
    selectedRole,
    setSelectedRole,
    showSplash,
    setShowSplash,
    settings,
    setUser,
  } = useAppStore()

  const [pageState, setPageState] = useState<PageState>('splash')

  // Check existing session + apply saved theme on mount
  useEffect(() => {
    applyTheme(settings.theme)
    auth.getSession().then(({ user }) => {
      if (user) setUser(user)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function redirectBasedOnRole(role: UserRole) {
    setPageState('redirecting')
    router.push(role === 'company_owner' || role === 'company_manager' ? '/home' : '/2home')
  }

  function redirectToAuth(role: UserRole) {
    setPageState('redirecting')
    router.push(role === 'company_owner' || role === 'company_manager' ? '/auth' : '/2auth')
  }

  function handleSplashComplete() {
    setShowSplash(false)
    appState.setSkipSplash(true)

    const storedRole = appState.getSelectedRole() as UserRole | null
    if (storedRole && isAuthenticated) {
      redirectBasedOnRole(storedRole)
    } else if (storedRole) {
      setSelectedRole(storedRole)
      redirectToAuth(storedRole)
    } else {
      setPageState('role_select')
    }
  }

  function handleRoleSelect(role: UserRole) {
    setSelectedRole(role)
    appState.setSelectedRole(role)
    redirectToAuth(role)
  }

  if (pageState === 'splash' || showSplash) {
    return (
      <SplashScreen
        onComplete={handleSplashComplete}
        skipSplash={!showSplash && appState.shouldSkipSplash()}
      />
    )
  }

  if (pageState === 'role_select') {
    return <RoleSelector onRoleSelect={handleRoleSelect} />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-muted" />
          <div className="absolute inset-0 border-4 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest animate-pulse">
          Loading…
        </p>
      </div>
    </div>
  )
}
