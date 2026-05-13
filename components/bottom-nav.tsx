'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Film, PlusSquare, Package, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
}

const companyNavItems: NavItem[] = [
  { href: '/home', icon: <Home className="w-6 h-6" />, label: 'Home' },
  { href: '/reels', icon: <Film className="w-6 h-6" />, label: 'Reels' },
  { href: '/add', icon: <PlusSquare className="w-6 h-6" />, label: 'Add' },
  { href: '/products', icon: <Package className="w-6 h-6" />, label: 'Products' },
  { href: '/profile', icon: <User className="w-6 h-6" />, label: 'Profile' },
]

const salesmanNavItems: NavItem[] = [
  { href: '/2home', icon: <Home className="w-6 h-6" />, label: 'Home' },
  { href: '/reels', icon: <Film className="w-6 h-6" />, label: 'Reels' },
  { href: '/network', icon: <Package className="w-6 h-6" />, label: 'Network' },
  { href: '/2profile', icon: <User className="w-6 h-6" />, label: 'Profile' },
]

interface BottomNavProps {
  variant?: 'company' | 'salesman'
}

export function BottomNav({ variant = 'company' }: BottomNavProps) {
  const pathname = usePathname()
  const navItems = variant === 'company' ? companyNavItems : salesmanNavItems

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'bottom-nav-item',
                isActive && 'active'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={cn(
                'p-2 border-2 transition-all',
                isActive 
                  ? 'border-primary bg-primary text-primary-foreground shadow-[2px_2px_0px_0px] shadow-foreground' 
                  : 'border-transparent'
              )}>
                {item.icon}
              </span>
              <span className="text-xs font-bold mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
