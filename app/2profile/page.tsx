"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Camera, Edit2, MapPin, Phone, Mail, Globe, Calendar, Users, Briefcase, Star, Package, Eye, Heart, MessageCircle, Settings, Share2, LogOut, ChevronRight, Shield, Award, TrendingUp } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { db } from "@/lib/db"
import { BottomNav } from "@/components/bottom-nav"
import { AIChatFab } from "@/components/ai-chat-fab"

export default function SalesmanProfilePage() {
  const router = useRouter()
  const { user, company, setUser, setCompany, logout, unreadNotificationCount } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "saved">("overview")
  const [stats, setStats] = useState({
    productsViewed: 0,
    companiesFollowed: 0,
    wishlistItems: 0,
    reelsWatched: 0
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoading(false)
    // Mock stats
    setStats({
      productsViewed: 156,
      companiesFollowed: 23,
      wishlistItems: 12,
      reelsWatched: 89
    })
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to sign out?")) {
      logout()
      router.push("/")
    }
  }

  const menuItems = [
    { icon: Heart, label: "My Wishlist", href: "/wishlist", badge: stats.wishlistItems },
    { icon: Eye, label: "Recently Viewed", href: "/recent", badge: null },
    { icon: Users, label: "Following", href: "/following", badge: stats.companiesFollowed },
    { icon: MessageCircle, label: "Messages", href: "/chat", badge: 3 },
    { icon: Settings, label: "Settings", href: "/2settings", badge: null },
    { icon: Shield, label: "Privacy & Security", href: "/privacy", badge: null },
    { icon: Share2, label: "Invite Friends", href: "/invite", badge: null },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse p-4 space-y-4">
          <div className="h-32 skeleton-gold rounded-none" />
          <div className="h-24 w-24 skeleton-gold rounded-full mx-auto -mt-12" />
          <div className="h-6 skeleton-gold w-48 mx-auto" />
          <div className="h-4 skeleton-gold w-32 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b-4 border-foreground">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted transition-colors border-2 border-transparent hover:border-foreground"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">My Profile</h1>
          <button
            onClick={() => router.push("/notifications")}
            className="p-2 hover:bg-muted transition-colors border-2 border-transparent hover:border-foreground relative"
          >
            <Bell className="w-6 h-6" />
            {unreadNotificationCount > 0 && (
              <span className="notification-dot" />
            )}
          </button>
        </div>
      </header>

      {/* Profile Banner */}
      <div className="golden-gradient h-24 relative">
        <button className="absolute right-4 bottom-4 p-2 bg-card border-2 border-foreground">
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-foreground bg-card overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-3xl font-bold">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-primary border-2 border-foreground rounded-full">
              <Camera className="w-3 h-3" />
            </button>
          </div>

          {/* Name & Role */}
          <h2 className="text-2xl font-bold mt-3">{user?.name || "User"}</h2>
          <p className="text-muted-foreground capitalize flex items-center gap-2">
            {user?.role === "salesman" ? (
              <>
                <Briefcase className="w-4 h-4" />
                Sales Representative
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Viewer
              </>
            )}
          </p>

          {/* Edit Profile Button */}
          <button 
            onClick={() => router.push("/2profile/edit")}
            className="brutalist-btn mt-4 flex items-center gap-2 text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-2 p-4 mt-4">
        <div className="brutalist-card p-3 text-center">
          <Package className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold">{stats.productsViewed}</p>
          <p className="text-xs text-muted-foreground">Viewed</p>
        </div>
        <div className="brutalist-card p-3 text-center">
          <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold">{stats.companiesFollowed}</p>
          <p className="text-xs text-muted-foreground">Following</p>
        </div>
        <div className="brutalist-card p-3 text-center">
          <Heart className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold">{stats.wishlistItems}</p>
          <p className="text-xs text-muted-foreground">Wishlist</p>
        </div>
        <div className="brutalist-card p-3 text-center">
          <TrendingUp className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold">{stats.reelsWatched}</p>
          <p className="text-xs text-muted-foreground">Reels</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-4 border-foreground mx-4">
        {(["overview", "activity", "saved"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "bg-card hover:bg-muted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "overview" && (
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="w-full brutalist-card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge !== null && (
                    <span className="bg-primary text-primary-foreground px-2 py-0.5 text-xs font-bold">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Recent Activity</h3>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="brutalist-card p-4 flex items-start gap-3">
                <div className="w-10 h-10 bg-muted flex items-center justify-center border-2 border-foreground">
                  {i % 2 === 0 ? <Heart className="w-5 h-5 text-primary" /> : <Eye className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {i % 2 === 0 ? "Added to wishlist" : "Viewed product"}
                  </p>
                  <p className="text-sm text-muted-foreground">Product Name #{i}</p>
                  <p className="text-xs text-muted-foreground mt-1">{i} hours ago</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Saved Items</h3>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="brutalist-card overflow-hidden">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm truncate">Product Name #{i}</p>
                    <p className="text-xs text-muted-foreground">Company Name</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full brutalist-card p-4 flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-bold">Sign Out</span>
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav userType="salesman" />

      {/* AI Chat FAB */}
      <AIChatFab />
    </div>
  )
}
