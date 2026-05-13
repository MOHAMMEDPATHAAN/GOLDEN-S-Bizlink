'use client'

import Link from 'next/link'
import { Bell, MessageCircle, Search, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

interface AppHeaderProps {
  title?: string
  showSearch?: boolean
  showNotifications?: boolean
  showMessages?: boolean
  showSettings?: boolean
}

export function AppHeader({
  title,
  showSearch = true,
  showNotifications = true,
  showMessages = true,
  showSettings = false,
}: AppHeaderProps) {
  const { unreadChatCount, unreadNotificationCount } = useAppStore()

  return (
    <header className="sticky top-0 z-40 bg-background border-b-4 border-foreground safe-top">
      <div className="flex items-center justify-between p-4">
        {/* Logo / Title */}
        <div className="flex items-center gap-2">
          <Link href="/home" className="flex items-center gap-1">
            <h1 className="text-xl font-black">
              <span className="golden-text">GOLDEN&apos;S</span>
            </h1>
          </Link>
          {title && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="font-bold text-foreground">{title}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <Link
              href="/search"
              className="p-2 border-4 border-foreground hover:bg-accent transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>
          )}

          {showMessages && (
            <Link
              href="/chat"
              className="relative p-2 border-4 border-foreground hover:bg-accent transition-colors"
              aria-label="Messages"
            >
              <MessageCircle className="w-5 h-5" />
              {unreadChatCount > 0 && (
                <span className="notification-dot" aria-label={`${unreadChatCount} unread messages`} />
              )}
            </Link>
          )}

          {showNotifications && (
            <Link
              href="/notifications"
              className="relative p-2 border-4 border-foreground hover:bg-accent transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="notification-dot" aria-label={`${unreadNotificationCount} unread notifications`} />
              )}
            </Link>
          )}

          {showSettings && (
            <Link
              href="/settings"
              className="p-2 border-4 border-foreground hover:bg-accent transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
