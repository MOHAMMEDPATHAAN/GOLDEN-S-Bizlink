"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Globe, Moon, Sun, Monitor, Volume2, VolumeX, Bell, BellOff, Eye, EyeOff, Shield, Lock, Smartphone, Trash2, Download, HelpCircle, FileText, MessageCircle, ChevronRight, Check, Sparkles } from "lucide-react"
import { useAppStore, ExtendedSettings } from "@/lib/store"
import { db } from "@/lib/db"
import { BottomNav } from "@/components/bottom-nav"

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
]

const THEMES = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "golden", label: "Golden Premium", icon: Sparkles },
] as const

export default function SalesmanSettingsPage() {
  const router = useRouter()
  const { settings, setSettings, user } = useAppStore()
  const [activeTab, setActiveTab] = useState<"general" | "notifications" | "privacy" | "about">("general")
  const [isSaving, setIsSaving] = useState(false)
  const [showLanguageModal, setShowLanguageModal] = useState(false)

  const handleSettingChange = <K extends keyof ExtendedSettings>(
    key: K,
    value: ExtendedSettings[K]
  ) => {
    setSettings({ [key]: value })
    
    // Apply theme immediately
    if (key === "theme") {
      applyTheme(value as ExtendedSettings["theme"])
    }
  }

  const applyTheme = (theme: ExtendedSettings["theme"]) => {
    const root = document.documentElement
    root.classList.remove("dark", "golden-premium")
    
    if (theme === "dark") {
      root.classList.add("dark")
    } else if (theme === "golden") {
      root.classList.add("dark", "golden-premium")
    } else if (theme === "system") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark")
      }
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Save to localStorage (mock Supabase)
      localStorage.setItem("bizlink_settings", JSON.stringify(settings))
      await new Promise(r => setTimeout(r, 500))
    } finally {
      setIsSaving(false)
    }
  }

  const ToggleSwitch = ({ 
    enabled, 
    onChange,
    disabled = false 
  }: { 
    enabled: boolean
    onChange: (value: boolean) => void
    disabled?: boolean
  }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative w-14 h-8 border-4 border-foreground transition-colors ${
        enabled ? "bg-primary" : "bg-muted"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-foreground transition-transform ${
          enabled ? "translate-x-6" : "translate-x-0.5"
        }`}
      />
    </button>
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b-4 border-foreground sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted transition-colors border-2 border-transparent hover:border-foreground"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="brutalist-btn text-sm py-2 px-4"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-t-2 border-foreground">
          {(["general", "notifications", "privacy", "about"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* General Tab */}
        {activeTab === "general" && (
          <>
            {/* Language */}
            <div className="brutalist-card p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Language & Region
              </h3>
              
              <button
                onClick={() => setShowLanguageModal(true)}
                className="w-full flex items-center justify-between p-3 border-2 border-foreground hover:bg-muted transition-colors"
              >
                <span>App Language</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {LANGUAGES.find(l => l.code === settings.language)?.name || "English"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Theme */}
            <div className="brutalist-card p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-primary" />
                Appearance
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => handleSettingChange("theme", theme.value)}
                    className={`p-3 border-4 flex flex-col items-center gap-2 transition-colors ${
                      settings.theme === theme.value
                        ? "border-primary bg-primary/10"
                        : "border-foreground hover:bg-muted"
                    }`}
                  >
                    <theme.icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{theme.label}</span>
                    {settings.theme === theme.value && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span>Font Size</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSettingChange("fontSize", Math.max(0.8, settings.fontSize - 0.1))}
                      className="w-8 h-8 border-2 border-foreground font-bold"
                    >
                      A-
                    </button>
                    <span className="w-12 text-center">{Math.round(settings.fontSize * 100)}%</span>
                    <button
                      onClick={() => handleSettingChange("fontSize", Math.min(1.4, settings.fontSize + 0.1))}
                      className="w-8 h-8 border-2 border-foreground font-bold"
                    >
                      A+
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>High Contrast</span>
                  <ToggleSwitch
                    enabled={settings.highContrast}
                    onChange={(v) => handleSettingChange("highContrast", v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>Reduced Motion</span>
                  <ToggleSwitch
                    enabled={settings.reducedMotion}
                    onChange={(v) => handleSettingChange("reducedMotion", v)}
                  />
                </div>
              </div>
            </div>

            {/* Playback */}
            <div className="brutalist-card p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Playback
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Auto-play Reels</span>
                  <ToggleSwitch
                    enabled={settings.autoPlayReels}
                    onChange={(v) => handleSettingChange("autoPlayReels", v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>Picture-in-Picture</span>
                  <ToggleSwitch
                    enabled={settings.pipEnabled}
                    onChange={(v) => handleSettingChange("pipEnabled", v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>Infinite Scroll</span>
                  <ToggleSwitch
                    enabled={settings.infiniteScroll}
                    onChange={(v) => handleSettingChange("infiniteScroll", v)}
                  />
                </div>
              </div>
            </div>

            {/* Data Usage */}
            <div className="brutalist-card p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                Data Usage
              </h3>
              
              <div className="space-y-2">
                {(["low", "medium", "high"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => handleSettingChange("dataUsage", level)}
                    className={`w-full p-3 border-2 flex items-center justify-between transition-colors ${
                      settings.dataUsage === level
                        ? "border-primary bg-primary/10"
                        : "border-foreground hover:bg-muted"
                    }`}
                  >
                    <div>
                      <p className="font-medium capitalize">{level}</p>
                      <p className="text-xs text-muted-foreground">
                        {level === "low" && "Minimal data, slower loading"}
                        {level === "medium" && "Balanced data usage"}
                        {level === "high" && "Best quality, more data"}
                      </p>
                    </div>
                    {settings.dataUsage === level && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <>
            <div className="brutalist-card p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Push Notifications
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Enable Notifications</span>
                  <ToggleSwitch
                    enabled={settings.pushNotifications}
                    onChange={(v) => handleSettingChange("pushNotifications", v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>Sound</span>
                  <ToggleSwitch
                    enabled={settings.notificationSound}
                    onChange={(v) => handleSettingChange("notificationSound", v)}
                    disabled={!settings.pushNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>Vibration</span>
                  <ToggleSwitch
                    enabled={settings.notificationVibration}
                    onChange={(v) => handleSettingChange("notificationVibration", v)}
                    disabled={!settings.pushNotifications}
                  />
                </div>
              </div>
            </div>

            <div className="brutalist-card p-4">
              <h3 className="font-bold mb-4">Notification Types</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Chat Messages</p>
                    <p className="text-xs text-muted-foreground">New messages from companies</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.chatNotifications}
                    onChange={(v) => handleSettingChange("chatNotifications", v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Product Updates</p>
                    <p className="text-xs text-muted-foreground">New products from followed companies</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.productNotifications}
                    onChange={(v) => handleSettingChange("productNotifications", v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Network Activity</p>
                    <p className="text-xs text-muted-foreground">Updates from your network</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.networkNotifications}
                    onChange={(v) => handleSettingChange("networkNotifications", v)}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Privacy Tab */}
        {activeTab === "privacy" && (
          <>
            <div className="brutalist-card p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Profile Privacy
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Public Profile</p>
                    <p className="text-xs text-muted-foreground">Anyone can see your profile</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.publicProfile}
                    onChange={(v) => handleSettingChange("publicProfile", v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Activity Status</p>
                    <p className="text-xs text-muted-foreground">Others can see when you are online</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.showActivity}
                    onChange={(v) => handleSettingChange("showActivity", v)}
                  />
                </div>
              </div>
            </div>

            <div className="brutalist-card p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Security
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">App Lock</p>
                    <p className="text-xs text-muted-foreground">Require PIN to open app</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.appLock}
                    onChange={(v) => handleSettingChange("appLock", v)}
                  />
                </div>

                <button className="w-full p-3 border-2 border-foreground flex items-center justify-between hover:bg-muted transition-colors">
                  <span>Change Password</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button className="w-full p-3 border-2 border-foreground flex items-center justify-between hover:bg-muted transition-colors">
                  <span>Active Sessions</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="brutalist-card p-4">
              <h3 className="font-bold mb-4">Data</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Save Search History</span>
                  <ToggleSwitch
                    enabled={settings.saveSearchHistory}
                    onChange={(v) => handleSettingChange("saveSearchHistory", v)}
                  />
                </div>

                <button className="w-full p-3 border-2 border-foreground flex items-center justify-between hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>Download My Data</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button className="w-full p-3 border-2 border-destructive text-destructive flex items-center justify-between hover:bg-destructive/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <>
            <div className="brutalist-card p-4 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary border-4 border-foreground flex items-center justify-center">
                <span className="text-2xl font-black text-primary-foreground">B</span>
              </div>
              <h2 className="text-xl font-bold">Bizlink</h2>
              <p className="text-muted-foreground">by Golden techS</p>
              <p className="text-sm text-muted-foreground mt-2">Version 1.0.0</p>
            </div>

            <div className="brutalist-card p-4 space-y-2">
              <button
                onClick={() => router.push("/aichat")}
                className="w-full p-3 border-2 border-foreground flex items-center justify-between hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Help & Support</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => router.push("/feedback")}
                className="w-full p-3 border-2 border-foreground flex items-center justify-between hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Feedback</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => router.push("/terms")}
                className="w-full p-3 border-2 border-foreground flex items-center justify-between hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Terms of Service</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => router.push("/privacy")}
                className="w-full p-3 border-2 border-foreground flex items-center justify-between hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Privacy Policy</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Made with care by Golden techS
            </p>
          </>
        )}
      </div>

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border-4 border-foreground max-h-[70vh] flex flex-col">
            <div className="p-4 border-b-4 border-foreground flex items-center justify-between">
              <h3 className="font-bold text-lg">Select Language</h3>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="p-2 hover:bg-muted transition-colors"
              >
                &times;
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    handleSettingChange("language", lang.code)
                    setShowLanguageModal(false)
                  }}
                  className={`w-full p-4 flex items-center justify-between border-b border-border hover:bg-muted transition-colors ${
                    settings.language === lang.code ? "bg-primary/10" : ""
                  }`}
                >
                  <span>{lang.name}</span>
                  {settings.language === lang.code && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav userType="salesman" />
    </div>
  )
}
