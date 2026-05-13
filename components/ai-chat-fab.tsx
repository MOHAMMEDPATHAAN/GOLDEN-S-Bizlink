'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AIChatFab() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      href="/aichat"
      className="fab"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Open AI Assistant"
    >
      <div className={cn(
        'transition-transform duration-200',
        isHovered && 'scale-110'
      )}>
        <Sparkles className="w-6 h-6 text-primary-foreground" />
      </div>
      
      {/* Tooltip */}
      <div className={cn(
        'absolute right-full mr-3 px-3 py-1 bg-card border-4 border-foreground text-sm font-bold whitespace-nowrap',
        'transition-all duration-200',
        isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
      )}>
        AI Assistant
      </div>
    </Link>
  )
}
