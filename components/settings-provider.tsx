"use client"

import { useEffect, createContext, useContext, ReactNode, useCallback } from "react"
import {
  useAppStore,
  applyTheme,
  applyFontSize,
  applyReducedMotion,
  applyHighContrast,
  applyLanguage,
  type ExtendedSettings,
} from "@/lib/store"

interface SettingsContextType {
  settings: ExtendedSettings
  updateSettings: (s: Partial<ExtendedSettings>) => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider")
  return ctx
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { settings, setSettings } = useAppStore()

  // Apply all DOM-level settings whenever they change
  useEffect(() => {
    applyTheme(settings.theme)
    applyFontSize(settings.fontSize)
    applyReducedMotion(settings.reducedMotion)
    applyHighContrast(settings.highContrast)
    applyLanguage(settings.language)
  }, [settings.theme, settings.fontSize, settings.reducedMotion, settings.highContrast, settings.language])

  // Also track system theme changes when set to 'system'
  useEffect(() => {
    if (settings.theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => applyTheme("system")
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [settings.theme])

  const updateSettings = useCallback(
    (s: Partial<ExtendedSettings>) => setSettings(s),
    [setSettings]
  )

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
