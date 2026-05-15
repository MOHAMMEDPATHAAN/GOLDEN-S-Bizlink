"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, Globe, DollarSign, Clock, Calendar, Hash, Play, 
  Shield, Key, Bell, Eye, Zap, Moon, Sun, Monitor, Sparkles,
  Volume2, VolumeX, Vibrate, Download, Upload, RefreshCw,
  HelpCircle, MessageSquare, Type, Contrast, Hand, Keyboard,
  Wifi, Image, Search, MapPin, Infinity, RotateCcw, Share2,
  Copy, FileDown, Timer, Maximize, ChevronRight, LogOut,
  Smartphone, Lock, Activity, Palette, Languages, Save, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BottomNav } from "@/components/bottom-nav"
import { AIChatFab } from "@/components/ai-chat-fab"
import { useAppStore } from "@/lib/store"
import { auth, settings as settingsDb } from "@/lib/db"

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
  { code: "bn", name: "Bengali" },
  { code: "tr", name: "Turkish" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "no", name: "Norwegian" },
  { code: "el", name: "Greek" },
  { code: "he", name: "Hebrew" },
  { code: "id", name: "Indonesian" },
]

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
]

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "EST (Eastern Time)" },
  { value: "America/Los_Angeles", label: "PST (Pacific Time)" },
  { value: "Europe/London", label: "GMT (London)" },
  { value: "Europe/Paris", label: "CET (Central European)" },
  { value: "Asia/Tokyo", label: "JST (Japan)" },
  { value: "Asia/Dubai", label: "GST (Gulf Standard)" },
  { value: "Asia/Kolkata", label: "IST (India)" },
  { value: "Asia/Shanghai", label: "CST (China)" },
  { value: "Australia/Sydney", label: "AEST (Australia)" },
]

type TabType = "general" | "account" | "display" | "notifications" | "privacy" | "advanced"

export default function SettingsPage() {
  const router = useRouter()
  const { user, settings, setSettings, clearSession } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabType>("general")
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings)

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
    // Apply display-related settings immediately so the user sees the change live
    const previewKeys: Array<keyof typeof settings> = ["theme", "language", "fontSize", "highContrast", "reducedMotion"]
    if (previewKeys.includes(key)) {
      setSettings({ [key]: value } as Partial<typeof settings>)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      setSettings(localSettings)
      if (user) {
        await settingsDb.update(user.id, localSettings)
      }
      setHasChanges(false)
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setLocalSettings(settings)
    setHasChanges(false)
  }

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?")
    if (confirmed) {
      await auth.signOut()
      clearSession()
      router.push("/")
    }
  }

  const handleClearCache = () => {
    if (typeof window !== "undefined") {
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(localSettings, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bizlink-settings.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportSettings = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string)
            setLocalSettings({ ...localSettings, ...imported })
            setHasChanges(true)
          } catch {
            alert("Invalid settings file")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Globe className="w-4 h-4" /> },
    { id: "account", label: "Account", icon: <Shield className="w-4 h-4" /> },
    { id: "display", label: "Display", icon: <Palette className="w-4 h-4" /> },
    { id: "notifications", label: "Alerts", icon: <Bell className="w-4 h-4" /> },
    { id: "privacy", label: "Privacy", icon: <Eye className="w-4 h-4" /> },
    { id: "advanced", label: "Advanced", icon: <Zap className="w-4 h-4" /> },
  ]

  if (!user) return null

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b-4 border-foreground safe-top">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted border-2 border-transparent hover:border-foreground transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="border-2 border-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="brutalist-btn text-sm py-2"
              >
                <Save className="w-4 h-4 mr-1" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <nav className="flex overflow-x-auto border-t-2 border-muted">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-4 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="p-4 max-w-2xl mx-auto">
        {/* General Tab */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <SettingSection title="Language & Region">
              <SettingRow
                icon={<Languages className="w-5 h-5" />}
                label="App Language"
                description="Choose your preferred language"
              >
                <Select
                  value={localSettings.language}
                  onValueChange={(v) => updateSetting("language", v)}
                >
                  <SelectTrigger className="w-40 border-2 border-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow
                icon={<DollarSign className="w-5 h-5" />}
                label="Currency"
                description="Default currency for prices"
              >
                <Select
                  value={localSettings.currency}
                  onValueChange={(v) => updateSetting("currency", v)}
                >
                  <SelectTrigger className="w-40 border-2 border-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow
                icon={<Clock className="w-5 h-5" />}
                label="Timezone"
                description="Your local timezone"
              >
                <Select
                  value={localSettings.timezone}
                  onValueChange={(v) => updateSetting("timezone", v)}
                >
                  <SelectTrigger className="w-48 border-2 border-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow
                icon={<Calendar className="w-5 h-5" />}
                label="Date Format"
                description="How dates are displayed"
              >
                <Select
                  value={localSettings.dateFormat}
                  onValueChange={(v) => updateSetting("dateFormat", v)}
                >
                  <SelectTrigger className="w-40 border-2 border-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow
                icon={<Hash className="w-5 h-5" />}
                label="Number Format"
                description="Decimal separator"
              >
                <Select
                  value={localSettings.numberFormat}
                  onValueChange={(v) => updateSetting("numberFormat", v)}
                >
                  <SelectTrigger className="w-40 border-2 border-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comma">1,234.56</SelectItem>
                    <SelectItem value="dot">1.234,56</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
            </SettingSection>

            <SettingSection title="Startup & Behavior">
              <SettingRow
                icon={<Play className="w-5 h-5" />}
                label="Startup Page"
                description="Where to open on launch"
              >
                <Select
                  value={localSettings.startupPage}
                  onValueChange={(v) => updateSetting("startupPage", v as "home" | "reels" | "products" | "last")}
                >
                  <SelectTrigger className="w-40 border-2 border-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="reels">Reels</SelectItem>
                    <SelectItem value="products">Products</SelectItem>
                    <SelectItem value="last">Last Visited</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow
                icon={<Key className="w-5 h-5" />}
                label="Auto Sign-in"
                description="Remember me on this device"
              >
                <Switch
                  checked={localSettings.autoSignIn}
                  onCheckedChange={(v) => updateSetting("autoSignIn", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<Shield className="w-5 h-5" />}
                label="Two-Factor Auth"
                description="Extra security layer"
              >
                <Switch
                  checked={localSettings.twoFactorEnabled}
                  onCheckedChange={(v) => updateSetting("twoFactorEnabled", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<Sparkles className="w-5 h-5" />}
                label="Beta Features"
                description="Try new features early"
              >
                <Switch
                  checked={localSettings.betaFeatures}
                  onCheckedChange={(v) => updateSetting("betaFeatures", v)}
                />
              </SettingRow>
            </SettingSection>

            <SettingSection title="Help & Support">
              <button
                onClick={() => router.push("/aichat")}
                className="w-full brutalist-card p-4 flex items-center justify-between hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium">Help & FAQ</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button
                onClick={() => window.open("mailto:support@bizlink.app?subject=Support Request")}
                className="w-full brutalist-card p-4 flex items-center justify-between hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="font-medium">Contact Support</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </SettingSection>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="space-y-6">
            <SettingSection title="Profile">
              <button
                onClick={() => router.push("/profile?edit=true")}
                className="w-full brutalist-card p-4 flex items-center justify-between hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 border-2 border-foreground flex items-center justify-center">
                    {user.companyLogo ? (
                      <img src={user.companyLogo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold">{user.companyName?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{user.companyName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </SettingSection>

            <SettingSection title="Security">
              <SettingRow
                icon={<Lock className="w-5 h-5" />}
                label="App Lock"
                description="Require PIN or biometric"
              >
                <Switch
                  checked={localSettings.appLock}
                  onCheckedChange={(v) => updateSetting("appLock", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<Activity className="w-5 h-5" />}
                label="Show Online Status"
                description="Let others see when you are active"
              >
                <Switch
                  checked={localSettings.showOnlineStatus}
                  onCheckedChange={(v) => updateSetting("showOnlineStatus", v)}
                />
              </SettingRow>

              <button
                onClick={() => router.push("/auth?mode=change-password")}
                className="w-full brutalist-card p-4 flex items-center justify-between hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-primary" />
                  <span className="font-medium">Change Password</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button className="w-full brutalist-card p-4 flex items-center justify-between hover:bg-accent">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <span className="font-medium">Active Sessions</span>
                    <p className="text-sm text-muted-foreground">Manage logged in devices</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </SettingSection>

            <SettingSection title="Account Actions">
              <button
                onClick={handleLogout}
                className="w-full brutalist-card p-4 flex items-center gap-3 hover:bg-destructive/10 text-destructive"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Log Out</span>
              </button>
            </SettingSection>
          </div>
        )}

        {/* Display Tab */}
        {activeTab === "display" && (
          <div className="space-y-6">
            <SettingSection title="Theme">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "system", label: "System", icon: <Monitor className="w-5 h-5" /> },
                  { id: "light", label: "Light", icon: <Sun className="w-5 h-5" /> },
                  { id: "dark", label: "Dark", icon: <Moon className="w-5 h-5" /> },
                  { id: "golden", label: "Golden Premium", icon: <Sparkles className="w-5 h-5" /> },
                ].map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => updateSetting("theme", theme.id as "system" | "light" | "dark" | "golden")}
                    className={`brutalist-card p-4 flex flex-col items-center gap-2 ${
                      localSettings.theme === theme.id ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {theme.icon}
                    <span className="text-sm font-medium">{theme.label}</span>
                  </button>
                ))}
              </div>
            </SettingSection>

            <SettingSection title="Accessibility">
              <SettingRow
                icon={<Type className="w-5 h-5" />}
                label="Font Size"
                description={`Size: ${localSettings.fontSize}`}
              >
                <div className="flex gap-1">
                  {(["small", "medium", "large"] as const).map(size => (
                    <button key={size}
                      onClick={() => updateSetting("fontSize", size)}
                      className={`px-3 py-1.5 text-xs font-bold border-2 capitalize transition-all ${
                        localSettings.fontSize === size
                          ? "bg-primary text-primary-foreground border-foreground shadow-[2px_2px_0px_0px] shadow-foreground"
                          : "border-foreground/30 hover:border-foreground"
                      }`}>
                      {size}
                    </button>
                  ))}
                </div>
              </SettingRow>

              <SettingRow
                icon={<Contrast className="w-5 h-5" />}
                label="High Contrast"
                description="Increase color contrast"
              >
                <Switch
                  checked={localSettings.highContrast}
                  onCheckedChange={(v) => updateSetting("highContrast", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<Hand className="w-5 h-5" />}
                label="Reduced Motion"
                description="Disable animations"
              >
                <Switch
                  checked={localSettings.reducedMotion}
                  onCheckedChange={(v) => updateSetting("reducedMotion", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<Volume2 className="w-5 h-5" />}
                label="Screen Reader"
                description="Enhanced announcements"
              >
                <Switch
                  checked={localSettings.screenReader}
                  onCheckedChange={(v) => updateSetting("screenReader", v)}
                />
              </SettingRow>
            </SettingSection>

            <SettingSection title="Shortcuts">
              <button className="w-full brutalist-card p-4 flex items-center justify-between hover:bg-accent">
                <div className="flex items-center gap-3">
                  <Keyboard className="w-5 h-5 text-primary" />
                  <span className="font-medium">Keyboard Shortcuts</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </SettingSection>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <SettingSection title="Push Notifications">
              <SettingRow
                icon={<Bell className="w-5 h-5" />}
                label="Enable Notifications"
                description="Receive push notifications"
              >
                <Switch
                  checked={localSettings.pushNotifications}
                  onCheckedChange={(v) => updateSetting("pushNotifications", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<Volume2 className="w-5 h-5" />}
                label="Sound"
                description="Play sound for notifications"
              >
                <Switch
                  checked={localSettings.notificationSound}
                  onCheckedChange={(v) => updateSetting("notificationSound", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<Vibrate className="w-5 h-5" />}
                label="Vibration"
                description="Vibrate on notifications"
              >
                <Switch
                  checked={localSettings.notificationVibration}
                  onCheckedChange={(v) => updateSetting("notificationVibration", v)}
                />
              </SettingRow>
            </SettingSection>

            <SettingSection title="Notification Types">
              <SettingRow
                icon={<MessageSquare className="w-5 h-5" />}
                label="Chat Messages"
                description="New messages from contacts"
              >
                <Switch
                  checked={localSettings.chatNotifications}
                  onCheckedChange={(v) => updateSetting("chatNotifications", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<Sparkles className="w-5 h-5" />}
                label="New Products"
                description="Products from followed companies"
              >
                <Switch
                  checked={localSettings.productNotifications}
                  onCheckedChange={(v) => updateSetting("productNotifications", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<Activity className="w-5 h-5" />}
                label="Network Activity"
                description="Followers and connections"
              >
                <Switch
                  checked={localSettings.networkNotifications}
                  onCheckedChange={(v) => updateSetting("networkNotifications", v)}
                />
              </SettingRow>
            </SettingSection>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <SettingSection title="Profile Visibility">
              <SettingRow
                icon={<Eye className="w-5 h-5" />}
                label="Public Profile"
                description="Anyone can view your profile"
              >
                <Switch
                  checked={localSettings.publicProfile}
                  onCheckedChange={(v) => updateSetting("publicProfile", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<Activity className="w-5 h-5" />}
                label="Show Activity"
                description="Display recent activity on profile"
              >
                <Switch
                  checked={localSettings.showActivity}
                  onCheckedChange={(v) => updateSetting("showActivity", v)}
                />
              </SettingRow>
            </SettingSection>

            <SettingSection title="Data & Privacy">
              <SettingRow
                icon={<Search className="w-5 h-5" />}
                label="Search History"
                description="Save your search queries"
              >
                <Switch
                  checked={localSettings.saveSearchHistory}
                  onCheckedChange={(v) => updateSetting("saveSearchHistory", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<MapPin className="w-5 h-5" />}
                label="Location Services"
                description="Allow location access"
              >
                <Switch
                  checked={localSettings.locationServices}
                  onCheckedChange={(v) => updateSetting("locationServices", v)}
                />
              </SettingRow>
            </SettingSection>

            <SettingSection title="Legal">
              <button
                onClick={() => router.push("/privacy")}
                className="w-full brutalist-card p-4 flex items-center justify-between hover:bg-accent"
              >
                <span className="font-medium">Privacy Policy</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button
                onClick={() => router.push("/terms")}
                className="w-full brutalist-card p-4 flex items-center justify-between hover:bg-accent"
              >
                <span className="font-medium">Terms of Service</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </SettingSection>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === "advanced" && (
          <div className="space-y-6">
            <SettingSection title="Data Usage">
              <SettingRow
                icon={<Wifi className="w-5 h-5" />}
                label="Data Saver"
                description="Reduce data consumption"
              >
                <Select
                  value={localSettings.dataUsage}
                  onValueChange={(v) => updateSetting("dataUsage", v as "low" | "medium" | "high")}
                >
                  <SelectTrigger className="w-32 border-2 border-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow
                icon={<Image className="w-5 h-5" />}
                label="Image Quality"
                description="Quality of loaded images"
              >
                <Select
                  value={localSettings.imageQuality}
                  onValueChange={(v) => updateSetting("imageQuality", v as "low" | "medium" | "high")}
                >
                  <SelectTrigger className="w-32 border-2 border-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
            </SettingSection>

            <SettingSection title="Feed Behavior">
              <SettingRow
                icon={<Play className="w-5 h-5" />}
                label="Auto-play Reels"
                description="Videos play automatically"
              >
                <Switch
                  checked={localSettings.autoPlayReels}
                  onCheckedChange={(v) => updateSetting("autoPlayReels", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<Maximize className="w-5 h-5" />}
                label="Picture-in-Picture"
                description="Mini player for videos"
              >
                <Switch
                  checked={localSettings.pipEnabled}
                  onCheckedChange={(v) => updateSetting("pipEnabled", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<Infinity className="w-5 h-5" />}
                label="Infinite Scroll"
                description="Load content continuously"
              >
                <Switch
                  checked={localSettings.infiniteScroll}
                  onCheckedChange={(v) => updateSetting("infiniteScroll", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<RotateCcw className="w-5 h-5" />}
                label="Pull to Refresh"
                description="Swipe down to refresh"
              >
                <Switch
                  checked={localSettings.pullToRefresh}
                  onCheckedChange={(v) => updateSetting("pullToRefresh", v)}
                />
              </SettingRow>
            </SettingSection>

            <SettingSection title="Product Cards">
              <SettingRow
                icon={<Share2 className="w-5 h-5" />}
                label="Quick Share"
                description="Show share button on cards"
              >
                <Switch
                  checked={localSettings.quickShare}
                  onCheckedChange={(v) => updateSetting("quickShare", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<Copy className="w-5 h-5" />}
                label="Copy Link"
                description="Show copy link button"
              >
                <Switch
                  checked={localSettings.copyLink}
                  onCheckedChange={(v) => updateSetting("copyLink", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<FileDown className="w-5 h-5" />}
                label="Export Data"
                description="Allow exporting to CSV"
              >
                <Switch
                  checked={localSettings.exportData}
                  onCheckedChange={(v) => updateSetting("exportData", v)}
                />
              </SettingRow>

              <SettingRow
                icon={<Timer className="w-5 h-5" />}
                label="Show Timestamps"
                description="Display last updated time"
              >
                <Switch
                  checked={localSettings.showTimestamps}
                  onCheckedChange={(v) => updateSetting("showTimestamps", v)}
                />
              </SettingRow>
            </SettingSection>

            <SettingSection title="Data Management">
              <button
                onClick={handleExportSettings}
                className="w-full brutalist-card p-4 flex items-center gap-3 hover:bg-accent"
              >
                <Download className="w-5 h-5 text-primary" />
                <span className="font-medium">Export Settings</span>
              </button>

              <button
                onClick={handleImportSettings}
                className="w-full brutalist-card p-4 flex items-center gap-3 hover:bg-accent"
              >
                <Upload className="w-5 h-5 text-primary" />
                <span className="font-medium">Import Settings</span>
              </button>

              <button
                onClick={handleClearCache}
                className="w-full brutalist-card p-4 flex items-center gap-3 hover:bg-accent text-destructive"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="font-medium">Clear Local Cache</span>
              </button>
            </SettingSection>

            <SettingSection title="About">
              <div className="brutalist-card p-4 space-y-2">
                <p className="text-sm text-muted-foreground">App Version</p>
                <p className="font-medium">Bizlink v1.0.0</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Developed by GOLDEN&apos;S (Golden techS)
                </p>
              </div>
            </SettingSection>
          </div>
        )}
      </main>

      <BottomNav variant={user.role === "salesman" || user.role === "viewer" ? "salesman" : "company"} />
      <AIChatFab />
    </div>
  )
}

// Helper Components
function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold uppercase tracking-wide text-primary">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function SettingRow({
  icon,
  label,
  description,
  children,
}: {
  icon: React.ReactNode
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="brutalist-card p-4 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="text-primary">{icon}</div>
        <div className="flex-1 min-w-0">
          <Label className="font-medium">{label}</Label>
          {description && (
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          )}
        </div>
      </div>
      <div className="ml-4 shrink-0">{children}</div>
    </div>
  )
}
