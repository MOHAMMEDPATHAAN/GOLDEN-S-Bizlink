'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, MessageCircle, Search, Settings, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

export interface AppHeaderProps {
  title?: string
  showSearch?: boolean
  showNotifications?: boolean
  showMessages?: boolean
  showSettings?: boolean
  showBack?: boolean
}

export function AppHeader({
  title,
  showSearch = true,
  showNotifications = true,
  showMessages = true,
  showSettings = false,
  showBack = false,
}: AppHeaderProps) {
  const { unreadChatCount, unreadNotificationCount } = useAppStore()
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 bg-background border-b-2 border-foreground safe-top">
      <div className="flex items-center justify-between px-3 py-2">
        {/* Logo / Title / Back */}
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              onClick={() => router.back()}
              className="p-1.5 border-2 border-foreground hover:bg-accent transition-colors active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <Link href="/home" className="flex items-center gap-1">
              <h1 className="text-base font-black">
                <span className="golden-text">GOLDEN&apos;S</span>
              </h1>
            </Link>
          )}
          {title && (
            <span className="font-bold text-sm text-foreground">{title}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <Link
              href="/search"
              className="p-1.5 border-2 border-foreground hover:bg-accent transition-colors active:scale-95"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Link>
          )}

          {showMessages && (
            <Link
              href="/chat"
              className="relative p-1.5 border-2 border-foreground hover:bg-accent transition-colors active:scale-95"
              aria-label="Messages"
            >
              <MessageCircle className="w-4 h-4" />
              {unreadChatCount > 0 && (
                <span className="notification-dot" aria-label={`${unreadChatCount} unread messages`} />
              )}
            </Link>
          )}

          {showNotifications && (
            <Link
              href="/notifications"
              className="relative p-1.5 border-2 border-foreground hover:bg-accent transition-colors active:scale-95"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="notification-dot" aria-label={`${unreadNotificationCount} unread notifications`} />
              )}
            </Link>
          )}

          {showSettings && (
            <Link
              href="/settings"
              className="p-1.5 border-2 border-foreground hover:bg-accent transition-colors active:scale-95"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
