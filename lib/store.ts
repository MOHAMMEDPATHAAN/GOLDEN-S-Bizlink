// ============================================
// BIZLINK — Global State (Zustand + persist)
// Developer: GOLDEN'S (Golden techS)
// ============================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Company, Theme, UserRole, SubscriptionPlan } from './types'

// ─── Extended settings ────────────────────────────────────────────────────
export interface ExtendedSettings {
  // Display
  theme: Theme           // 'system' | 'light' | 'dark' | 'golden'
  language: string
  fontSize: 'small' | 'medium' | 'large'
  highContrast: boolean
  reducedMotion: boolean
  screenReader: boolean
  // General
  currency: string
  timezone: string
  dateFormat: string
  startupPage: 'home' | 'reels' | 'products' | 'last'
  autoSignIn: boolean
  // Notifications
  pushNotifications: boolean
  notificationSound: boolean
  notificationVibration: boolean
  chatNotifications: boolean
  productNotifications: boolean
  networkNotifications: boolean
  // Privacy
  showOnlineStatus: boolean
  showActivity: boolean
  publicProfile: boolean
  saveSearchHistory: boolean
  locationServices: boolean
  // Advanced
  autoPlayReels: boolean
  dataUsage: 'low' | 'medium' | 'high'
  imageQuality: 'low' | 'medium' | 'high'
  infiniteScroll: boolean
  pipEnabled: boolean
  pullToRefresh: boolean
  quickShare: boolean
  copyLink: boolean
  exportData: boolean
  showTimestamps: boolean
  numberFormat: 'comma' | 'dot'
  // Security
  appLock: boolean
  twoFactorEnabled: boolean
  betaFeatures: boolean
  [key: string]: unknown   // index signature for Record<string,unknown> compatibility
}

const defaultSettings: ExtendedSettings = {
  theme: 'system',
  language: 'en',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  currency: 'USD',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  startupPage: 'home',
  autoSignIn: true,
  pushNotifications: true,
  notificationSound: true,
  notificationVibration: true,
  chatNotifications: true,
  productNotifications: true,
  networkNotifications: true,
  showOnlineStatus: true,
  showActivity: true,
  publicProfile: true,
  saveSearchHistory: true,
  locationServices: false,
  autoPlayReels: true,
  dataUsage: 'medium',
  imageQuality: 'high',
  infiniteScroll: true,
  pipEnabled: true,
  pullToRefresh: true,
  quickShare: true,
  copyLink: true,
  exportData: true,
  showTimestamps: true,
  numberFormat: 'comma',
  appLock: false,
  twoFactorEnabled: false,
  betaFeatures: false,
}

// ─── Store shape ──────────────────────────────────────────────────────────
interface AppState {
  // Auth
  user: User | null
  isAuthenticated: boolean
  selectedRole: UserRole | null
  // Company
  company: Company | null
  // Settings
  settings: ExtendedSettings
  // UI
  showSplash: boolean
  showAppLock: boolean
  isLoading: boolean
  currentPage: string
  // Counts
  unreadChatCount: number
  unreadNotificationCount: number

  // Actions
  setUser: (u: User | null) => void
  setSelectedRole: (r: UserRole | null) => void
  setCompany: (c: Company | null) => void
  setSettings: (s: Partial<ExtendedSettings>) => void
  setShowSplash: (v: boolean) => void
  setShowAppLock: (v: boolean) => void
  setIsLoading: (v: boolean) => void
  setCurrentPage: (p: string) => void
  setUnreadChatCount: (n: number) => void
  setUnreadNotificationCount: (n: number) => void
  clearSession: () => void
  logout: () => void

  // Derived helpers (not persisted)
  plan: () => SubscriptionPlan
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      selectedRole: null,
      company: null,
      settings: defaultSettings,
      showSplash: true,
      showAppLock: false,
      isLoading: false,
      currentPage: 'home',
      unreadChatCount: 0,
      unreadNotificationCount: 0,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSelectedRole: (selectedRole) => set({ selectedRole }),
      setCompany: (company) => set({ company }),
      setSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),
      setShowSplash: (showSplash) => set({ showSplash }),
      setShowAppLock: (showAppLock) => set({ showAppLock }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setUnreadChatCount: (unreadChatCount) => set({ unreadChatCount }),
      setUnreadNotificationCount: (unreadNotificationCount) => set({ unreadNotificationCount }),
      clearSession: () =>
        set({
          user: null,
          isAuthenticated: false,
          company: null,
          unreadChatCount: 0,
          unreadNotificationCount: 0,
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          selectedRole: null,
          company: null,
          settings: defaultSettings,
          showAppLock: false,
          unreadChatCount: 0,
          unreadNotificationCount: 0,
        }),

      plan: () => get().company?.subscription_plan ?? get().user?.subscription_plan ?? 'starter',
    }),
    {
      name: 'bizlink-store-v2',
      partialize: (s) => ({
        user: s.user,
        isAuthenticated: s.isAuthenticated,
        selectedRole: s.selectedRole,
        company: s.company,
        settings: s.settings,
        showSplash: s.showSplash,
      }),
    }
  )
)

// ─── DOM helpers ──────────────────────────────────────────────────────────
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  const root = document.documentElement
  root.classList.remove('light', 'dark', 'golden-premium')
  if (theme === 'system') {
    root.classList.add(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  } else if (theme === 'golden') {
    root.classList.add('dark', 'golden-premium')
  } else {
    root.classList.add(theme)
  }
}

export function applyFontSize(size: 'small' | 'medium' | 'large'): void {
  if (typeof window === 'undefined') return
  const map = { small: '0.875', medium: '1', large: '1.125' }
  document.documentElement.style.setProperty('--app-font-scale', map[size])
}

export function applyReducedMotion(v: boolean): void {
  if (typeof window === 'undefined') return
  document.documentElement.classList.toggle('reduce-motion', v)
}

export function applyHighContrast(v: boolean): void {
  if (typeof window === 'undefined') return
  document.documentElement.classList.toggle('high-contrast', v)
}

export function applyLanguage(code: string): void {
  if (typeof window === 'undefined') return
  const rtl = ['ar', 'ur', 'fa', 'he']
  document.documentElement.lang = code
  document.documentElement.dir = rtl.includes(code) ? 'rtl' : 'ltr'
}
