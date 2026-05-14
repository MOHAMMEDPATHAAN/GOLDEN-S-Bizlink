"use client"

import { useEffect, createContext, useContext, ReactNode } from "react"
import { useAppStore, applyTheme, applyFontSize, applyReducedMotion, applyHighContrast, ExtendedSettings } from "@/lib/store"
import { applyLanguage, t, isRTL, LANGUAGES } from "@/lib/i18n"

interface SettingsContextType {
  settings: ExtendedSettings
  updateSettings: (newSettings: Partial<ExtendedSettings>) => void
  t: (key: Parameters<typeof t>[0]) => string
  isRTL: boolean
  languages: typeof LANGUAGES
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { settings, setSettings } = useAppStore()
  
  // Apply all settings on mount and when they change
  useEffect(() => {
    // Apply theme
    applyTheme(settings.theme)
    
    // Apply font size
    const fontSizeMap: Record<number, 'small' | 'medium' | 'large'> = {
      0.875: 'small',
      1: 'medium',
      1.125: 'large',
    }
    applyFontSize(fontSizeMap[settings.fontSize] || 'medium')
    
    // Apply reduced motion
    applyReducedMotion(settings.reducedMotion)
    
    // Apply high contrast
    applyHighContrast(settings.highContrast)
    
    // Apply language and RTL
    applyLanguage(settings.language)
    
  }, [settings])
  
  // Listen for system theme changes
  useEffect(() => {
    if (settings.theme !== 'system') return
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyTheme('system')
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [settings.theme])
  
  const updateSettings = (newSettings: Partial<ExtendedSettings>) => {
    setSettings(newSettings)
  }
  
  const translate = (key: Parameters<typeof t>[0]) => t(key, settings.language)
  const rtl = isRTL(settings.language)
  
  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      t: translate,
      isRTL: rtl,
      languages: LANGUAGES,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}
