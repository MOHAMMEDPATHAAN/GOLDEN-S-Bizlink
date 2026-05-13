"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, BellOff, Heart, MessageCircle, Package, User, Building2, Star, TrendingUp, AlertCircle, CheckCircle, Settings, Trash2, Check, X } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { BottomNav } from "@/components/bottom-nav"

interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "product" | "order" | "system" | "promotion"
  title: string
  message: string
  fromUserId?: string
  fromUserName?: string
  fromUserLogo?: string
  linkTo?: string
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user, setUnreadNotificationCount } = useAppStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      // Mock notifications
      const mockNotifications: Notification[] = [
        {
          id: "notif-1",
          type: "like",
          title: "New Like",
          message: "Company ABC liked your product",
          fromUserId: "company-1",
          fromUserName: "Company ABC",
          linkTo: "/products/product-1",
          isRead: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: "notif-2",
          type: "comment",
          title: "New Comment",
          message: "Company XYZ commented on your reel",
          fromUserId: "company-2",
          fromUserName: "Company XYZ",
          linkTo: "/reels/reel-1",
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "notif-3",
          type: "follow",
          title: "New Follower",
          message: "Global Industries started following you",
          fromUserId: "company-3",
          fromUserName: "Global Industries",
          linkTo: "/company/company-3",
          isRead: false,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "notif-4",
          type: "product",
          title: "Product Update",
          message: "Your product 'Widget Pro' has reached 1000 views!",
          linkTo: "/products/product-1",
          isRead: true,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "notif-5",
          type: "order",
          title: "New Inquiry",
          message: "You received a new wholesale inquiry from Tech Solutions",
          fromUserId: "company-4",
          fromUserName: "Tech Solutions",
          linkTo: "/chat?id=conv-1",
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "notif-6",
          type: "system",
          title: "Profile Incomplete",
          message: "Complete your profile to increase visibility by 50%",
          linkTo: "/profile",
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "notif-7",
          type: "promotion",
          title: "Special Offer",
          message: "Upgrade to Premium and get 3 months free!",
          linkTo: "/packages",
          isRead: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]
      setNotifications(mockNotifications)
      setUnreadNotificationCount(mockNotifications.filter(n => !n.isRead).length)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (isSelecting) {
      toggleSelection(notification.id)
      return
    }

    // Mark as read
    setNotifications(notifications.map(n => 
      n.id === notification.id ? { ...n, isRead: true } : n
    ))
    setUnreadNotificationCount(notifications.filter(n => !n.isRead && n.id !== notification.id).length)

    // Navigate
    if (notification.linkTo) {
      router.push(notification.linkTo)
    }
  }

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedNotifications)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedNotifications(newSelection)
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    setUnreadNotificationCount(0)
  }

  const deleteSelected = () => {
    setNotifications(notifications.filter(n => !selectedNotifications.has(n.id)))
    setSelectedNotifications(new Set())
    setIsSelecting(false)
  }

  const markSelectedAsRead = () => {
    setNotifications(notifications.map(n => 
      selectedNotifications.has(n.id) ? { ...n, isRead: true } : n
    ))
    setUnreadNotificationCount(
      notifications.filter(n => !n.isRead && !selectedNotifications.has(n.id)).length
    )
    setSelectedNotifications(new Set())
    setIsSelecting(false)
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case "follow":
        return <User className="w-5 h-5 text-green-500" />
      case "product":
        return <Package className="w-5 h-5 text-primary" />
      case "order":
        return <TrendingUp className="w-5 h-5 text-orange-500" />
      case "system":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "promotion":
        return <Star className="w-5 h-5 text-purple-500" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.isRead)
    : notifications

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
          <h1 className="text-xl font-bold">Notifications</h1>
          <button
            onClick={() => router.push("/settings")}
            className="p-2 hover:bg-muted transition-colors border-2 border-transparent hover:border-foreground"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="px-4 pb-4 flex items-center justify-between">
          <div className="flex border-2 border-foreground">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-sm font-bold transition-colors ${
                filter === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 text-sm font-bold transition-colors ${
                filter === "unread" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              Unread ({notifications.filter(n => !n.isRead).length})
            </button>
          </div>

          {isSelecting ? (
            <div className="flex items-center gap-2">
              <button
                onClick={markSelectedAsRead}
                disabled={selectedNotifications.size === 0}
                className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={deleteSelected}
                disabled={selectedNotifications.size === 0}
                className="p-2 hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setIsSelecting(false)
                  setSelectedNotifications(new Set())
                }}
                className="p-2 hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary hover:underline"
              >
                Mark all read
              </button>
              <button
                onClick={() => setIsSelecting(true)}
                className="p-2 hover:bg-muted transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Notifications List */}
      <div className="divide-y-2 divide-foreground">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-start gap-3">
              <div className="w-12 h-12 rounded-full skeleton-gold" />
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton-gold w-48" />
                <div className="h-3 skeleton-gold w-32" />
              </div>
            </div>
          ))
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellOff className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-bold text-lg">No Notifications</h3>
            <p className="text-muted-foreground">
              {filter === "unread" ? "You're all caught up!" : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                notification.isRead ? "bg-background" : "bg-primary/5"
              } hover:bg-muted`}
            >
              {isSelecting && (
                <div className={`w-6 h-6 border-2 border-foreground flex items-center justify-center flex-shrink-0 ${
                  selectedNotifications.has(notification.id) ? "bg-primary" : "bg-background"
                }`}>
                  {selectedNotifications.has(notification.id) && (
                    <Check className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
              )}

              <div className="w-12 h-12 rounded-full border-4 border-foreground bg-card flex items-center justify-center flex-shrink-0 overflow-hidden">
                {notification.fromUserLogo ? (
                  <img src={notification.fromUserLogo} alt="" className="w-full h-full object-cover" />
                ) : notification.fromUserName ? (
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                ) : (
                  getNotificationIcon(notification.type)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(notification.type)}
                    <p className="font-bold text-sm">{notification.title}</p>
                  </div>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{formatDate(notification.createdAt)}</p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav userType={user?.role === "salesman" || user?.role === "viewer" ? "salesman" : "company"} />
    </div>
  )
}
