'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface SplashScreenProps {
  onComplete: () => void
  skipSplash?: boolean
}

export function SplashScreen({ onComplete, skipSplash = false }: SplashScreenProps) {
  const [isAnimating, setIsAnimating] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (skipSplash) {
      onComplete()
      return
    }

    // Animation duration
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(onComplete, 500)
    }, 2500)

    return () => clearTimeout(timer)
  }, [onComplete, skipSplash])

  if (skipSplash) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center',
        'bg-gradient-to-br from-background via-background to-accent',
        'transition-opacity duration-500',
        fadeOut && 'opacity-0 pointer-events-none'
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading Bizlink"
    >
      {/* Logo Container */}
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo */}
        <div className="relative">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            <span className="golden-text logo-animate inline-block">GOLDEN</span>
            <span className={cn(
              'inline-block transition-all duration-700',
              isAnimating ? 'opacity-100 ml-0' : 'opacity-0 -ml-4'
            )}>
              <span className="text-muted-foreground font-light text-3xl md:text-5xl align-super">tech</span>
            </span>
            <span className={cn(
              'golden-text inline-block transition-all duration-500',
              isAnimating ? 'translate-x-0' : '-translate-x-8'
            )}>&apos;S</span>
          </h1>
        </div>

        {/* Bizlink Text */}
        <div className="brutalist-card px-6 py-2 bg-primary">
          <span className="text-2xl md:text-3xl font-bold text-primary-foreground tracking-widest">
            BIZLINK
          </span>
        </div>

        {/* Loading Spinner */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-muted" />
            <div className="absolute inset-0 border-4 border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
            Loading
          </p>
        </div>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading Bizlink application, please wait.</span>
    </div>
  )
}
