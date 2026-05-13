'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Settings,
  Bell,
  Package,
  BarChart3,
  Shield,
  CreditCard,
  Share2,
  ChevronRight,
  Edit2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Building2,
  Users,
  Calendar,
  ExternalLink,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppHeader } from '@/components/app-header'
import { BottomNav } from '@/components/bottom-nav'
import { AIChatFab } from '@/components/ai-chat-fab'
import { useAppStore } from '@/lib/store'
import { auth, companies } from '@/lib/db'

type ProfileTab = 'overview' | 'products' | 'analysis' | 'privacy' | 'billing' | 'share'

const TABS = [
  { id: 'overview', label: 'Overview', icon: <Building2 className="w-4 h-4" /> },
  { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
  { id: 'analysis', label: 'Analysis', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'share', label: 'Share', icon: <Share2 className="w-4 h-4" /> },
]

export default function ProfilePage() {
  const router = useRouter()
  const { user, company, setUser, setCompany, logout } = useAppStore()
  
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [profileCompleteness, setProfileCompleteness] = useState(65)

  useEffect(() => {
    const loadData = async () => {
      const { user } = await auth.getSession()
      if (!user) {
        router.push('/auth')
        return
      }
      setUser(user)
      
      // Load company data
      const companyData = await companies.getByOwner(user.id)
      if (companyData) {
        setCompany(companyData)
      }
      
      setIsLoading(false)
    }
    loadData()
  }, [router, setUser, setCompany])

  const handleLogout = async () => {
    await auth.signOut()
    logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-muted" />
            <div className="absolute inset-0 border-4 border-transparent border-t-primary animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b-4 border-foreground safe-top">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-black">
            <span className="golden-text">PROFILE</span>
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="relative p-2 border-4 border-foreground hover:bg-accent transition-colors"
            >
              <Bell className="w-5 h-5" />
            </Link>
            <Link
              href="/settings"
              className="p-2 border-4 border-foreground hover:bg-accent transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Profile Header */}
        <div className="brutalist-card p-4">
          <div className="flex items-start gap-4">
            {/* Company Logo */}
            <div className="relative">
              <div className="w-20 h-20 border-4 border-foreground bg-muted overflow-hidden">
                {company?.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <button
                className="absolute -bottom-2 -right-2 p-1.5 bg-primary border-4 border-foreground"
                aria-label="Edit profile picture"
              >
                <Edit2 className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <h2 className="text-xl font-black line-clamp-1">
                {company?.name || 'Your Company'}
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                {company?.industry || 'Industry'}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {company?.city || 'City'}, {company?.country || 'Location'}
              </div>
            </div>
          </div>

          {/* Profile Completeness */}
          <div className="mt-4 pt-4 border-t-4 border-foreground">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">Profile Completeness</span>
              <span className="text-sm font-bold text-primary">{profileCompleteness}%</span>
            </div>
            <div className="h-3 bg-muted border-2 border-foreground">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${profileCompleteness}%` }}
              />
            </div>
            {profileCompleteness < 100 && (
              <p className="text-xs text-muted-foreground mt-2">
                Complete your profile to increase visibility
              </p>
            )}
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="brutalist-card p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Mail className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Email</span>
            </div>
            <p className="text-sm font-medium truncate">{company?.email || user?.email}</p>
          </div>
          <div className="brutalist-card p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Phone className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Phone</span>
            </div>
            <p className="text-sm font-medium truncate">{company?.phone || 'Not set'}</p>
          </div>
          <div className="brutalist-card p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Employees</span>
            </div>
            <p className="text-sm font-medium">{company?.employee_count || '0'}</p>
          </div>
          <div className="brutalist-card p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Est.</span>
            </div>
            <p className="text-sm font-medium">{company?.year_established || 'N/A'}</p>
          </div>
        </div>

        {/* Website */}
        {company?.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="brutalist-card p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold truncate">{company.website}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </a>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ProfileTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 border-4 whitespace-nowrap font-bold transition-all',
                activeTab === tab.id
                  ? 'border-primary bg-primary text-primary-foreground shadow-[3px_3px_0px_0px] shadow-foreground'
                  : 'border-foreground bg-background hover:bg-accent'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="brutalist-card p-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Company Profile</h3>
              <p className="text-sm text-muted-foreground">
                {company?.profile || 'No company profile set. Add a description to help others understand your business.'}
              </p>

              {/* Production Types */}
              {company?.production_types && company.production_types.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wide mb-2">Production Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {company.production_types.map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1 text-xs font-bold border-2 border-foreground bg-accent"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href="/profile/edit"
                className="brutalist-btn w-full text-center flex items-center justify-center gap-2 mt-4"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Link>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Your Products</h3>
                <Link
                  href="/add"
                  className="px-4 py-2 border-4 border-foreground bg-primary text-primary-foreground font-bold text-sm"
                >
                  Add Product
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                Manage your product catalog and showcase your offerings.
              </p>
              <Link
                href="/products"
                className="brutalist-card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-bold">View All Products</p>
                    <p className="text-sm text-muted-foreground">0 products listed</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track your profile views, product engagement, and more.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 border-4 border-foreground text-center">
                  <p className="text-3xl font-black text-primary">0</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Profile Views</p>
                </div>
                <div className="p-4 border-4 border-foreground text-center">
                  <p className="text-3xl font-black text-primary">0</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Product Views</p>
                </div>
                <div className="p-4 border-4 border-foreground text-center">
                  <p className="text-3xl font-black text-primary">0</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Inquiries</p>
                </div>
                <div className="p-4 border-4 border-foreground text-center">
                  <p className="text-3xl font-black text-primary">0</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Connections</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Privacy & Data</h3>
              <p className="text-sm text-muted-foreground">
                Manage your privacy settings and data preferences.
              </p>
              <div className="space-y-3">
                <Link href="/settings#privacy" className="brutalist-card p-3 flex items-center justify-between">
                  <span className="font-medium">Privacy Settings</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href="/privacy" className="brutalist-card p-3 flex items-center justify-between">
                  <span className="font-medium">Privacy Policy</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href="/terms" className="brutalist-card p-3 flex items-center justify-between">
                  <span className="font-medium">Terms of Service</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Subscription & Billing</h3>
              <div className="p-4 border-4 border-primary bg-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Current Plan</span>
                  <span className="px-3 py-1 bg-primary text-primary-foreground font-bold text-sm">
                    FREE
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upgrade to unlock premium features like analytics, priority support, and more.
                </p>
              </div>
              <Link
                href="/packages"
                className="brutalist-btn w-full text-center"
              >
                View Packages
              </Link>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Share Your Profile</h3>
              <p className="text-sm text-muted-foreground">
                Share your company profile with potential partners and clients.
              </p>
              <div className="p-4 border-4 border-foreground bg-muted">
                <p className="text-sm font-mono break-all">
                  bizlink.app/company/{company?.id || 'your-company'}
                </p>
              </div>
              <button className="brutalist-btn w-full text-center flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Copy Link
              </button>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full p-4 border-4 border-destructive text-destructive font-bold flex items-center justify-center gap-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </main>

      <BottomNav variant={user?.role === 'salesman' || user?.role === 'viewer' ? 'salesman' : 'company'} />
    </div>
  )
}
