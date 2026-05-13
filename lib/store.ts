// ============================================
// BIZLINK - Global State Store (Zustand)
// Developer: GOLDEN'S (Golden techS)
// ============================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Company, UserSettings, Theme, UserRole } from './types'

// Extended settings type with all options
export interface ExtendedSettings {
  // General
  language: string
  currency: string
  timezone: string
  dateFormat: string
  numberFormat: string
  startupPage: 'home' | 'reels' | 'products' | 'last'
  autoSignIn: boolean
  twoFactorEnabled: boolean
  betaFeatures: boolean
  
  // Account
  appLock: boolean
  showOnlineStatus: boolean
  
  // Display
  theme: 'system' | 'light' | 'dark' | 'golden'
  fontSize: number
  highContrast: boolean
  reducedMotion: boolean
  screenReader: boolean
  
  // Notifications
  pushNotifications: boolean
  notificationSound: boolean
  notificationVibration: boolean
  chatNotifications: boolean
  productNotifications: boolean
  networkNotifications: boolean
  
  // Privacy
  publicProfile: boolean
  showActivity: boolean
  saveSearchHistory: boolean
  locationServices: boolean
  
  // Advanced
  dataUsage: 'low' | 'medium' | 'high'
  imageQuality: 'low' | 'medium' | 'high'
  autoPlayReels: boolean
  pipEnabled: boolean
  infiniteScroll: boolean
  pullToRefresh: boolean
  quickShare: boolean
  copyLink: boolean
  exportData: boolean
  showTimestamps: boolean
}

const defaultSettings: ExtendedSettings = {
  language: 'en',
  currency: 'USD',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  numberFormat: 'comma',
  startupPage: 'home',
  autoSignIn: true,
  twoFactorEnabled: false,
  betaFeatures: false,
  appLock: false,
  showOnlineStatus: true,
  theme: 'system',
  fontSize: 1,
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  pushNotifications: true,
  notificationSound: true,
  notificationVibration: true,
  chatNotifications: true,
  productNotifications: true,
  networkNotifications: true,
  publicProfile: true,
  showActivity: true,
  saveSearchHistory: true,
  locationServices: false,
  dataUsage: 'medium',
  imageQuality: 'high',
  autoPlayReels: true,
  pipEnabled: true,
  infiniteScroll: true,
  pullToRefresh: true,
  quickShare: true,
  copyLink: true,
  exportData: true,
  showTimestamps: true,
}

interface AppState {
  // Auth
  user: User | null
  isAuthenticated: boolean
  selectedRole: UserRole | null
  
  // Company
  company: Company | null
  
  // Settings
  settings: ExtendedSettings
  theme: Theme
  language: string
  
  // UI State
  isLoading: boolean
  showSplash: boolean
  showAppLock: boolean
  currentPage: string
  
  // Notifications
  unreadChatCount: number
  unreadNotificationCount: number
  
  // Actions
  setUser: (user: User | null) => void
  setSelectedRole: (role: UserRole) => void
  setCompany: (company: Company | null) => void
  setSettings: (settings: Partial<ExtendedSettings>) => void
  setTheme: (theme: Theme) => void
  setLanguage: (language: string) => void
  setIsLoading: (loading: boolean) => void
  setShowSplash: (show: boolean) => void
  setShowAppLock: (show: boolean) => void
  setCurrentPage: (page: string) => void
  setUnreadChatCount: (count: number) => void
  setUnreadNotificationCount: (count: number) => void
  clearSession: () => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      selectedRole: null,
      company: null,
      settings: defaultSettings,
      theme: 'system',
      language: 'en',
      isLoading: false,
      showSplash: true,
      showAppLock: false,
      currentPage: 'home',
      unreadChatCount: 0,
      unreadNotificationCount: 0,
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSelectedRole: (role) => set({ selectedRole: role }),
      setCompany: (company) => set({ company }),
      setSettings: (newSettings) => set((state) => ({ 
        settings: { ...state.settings, ...newSettings },
        theme: newSettings.theme || state.theme,
        language: newSettings.language || state.language
      })),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setShowSplash: (showSplash) => set({ showSplash }),
      setShowAppLock: (showAppLock) => set({ showAppLock }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setUnreadChatCount: (unreadChatCount) => set({ unreadChatCount }),
      setUnreadNotificationCount: (unreadNotificationCount) => set({ unreadNotificationCount }),
      clearSession: () => set({
        user: null,
        isAuthenticated: false,
        company: null,
        showAppLock: false,
        unreadChatCount: 0,
        unreadNotificationCount: 0,
      }),
      logout: () => set({
        user: null,
        isAuthenticated: false,
        company: null,
        settings: defaultSettings,
        showAppLock: false,
        unreadChatCount: 0,
        unreadNotificationCount: 0,
      }),
    }),
    {
      name: 'bizlink-app-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        selectedRole: state.selectedRole,
        company: state.company,
        settings: state.settings,
        theme: state.theme,
        language: state.language,
        showSplash: state.showSplash,
      }),
    }
  )
)

// Theme utilities
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  
  const root = document.documentElement
  
  // Remove all theme classes
  root.classList.remove('light', 'dark', 'golden-premium')
  
  if (theme === 'system') {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.add(systemDark ? 'dark' : 'light')
  } else if (theme === 'golden_premium') {
    root.classList.add('dark', 'golden-premium')
  } else {
    root.classList.add(theme)
  }
}

// Font size utilities
export function applyFontSize(size: 'small' | 'medium' | 'large'): void {
  if (typeof window === 'undefined') return
  
  const root = document.documentElement
  const scales: Record<string, string> = {
    small: '0.875',
    medium: '1',
    large: '1.125',
  }
  root.style.setProperty('--app-font-scale', scales[size])
}

// Reduced motion
export function applyReducedMotion(reduce: boolean): void {
  if (typeof window === 'undefined') return
  
  const root = document.documentElement
  if (reduce) {
    root.classList.add('reduce-motion')
  } else {
    root.classList.remove('reduce-motion')
  }
}

// High contrast
export function applyHighContrast(enable: boolean): void {
  if (typeof window === 'undefined') return
  
  const root = document.documentElement
  if (enable) {
    root.classList.add('high-contrast')
  } else {
    root.classList.remove('high-contrast')
  }
}
