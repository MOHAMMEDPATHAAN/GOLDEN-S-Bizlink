"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX, Play, Pause, MoreVertical, User, ChevronUp, ChevronDown, Eye, X } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { BottomNav } from "@/components/bottom-nav"
import { AIChatFab } from "@/components/ai-chat-fab"

interface Reel {
  id: string
  companyId: string
  companyName: string
  companyLogo?: string
  videoUrl?: string
  thumbnailUrl?: string
  description: string
  productId?: string
  productName?: string
  likes: number
  comments: number
  shares: number
  views: number
  isLiked: boolean
  isSaved: boolean
  createdAt: string
}

export default function ReelsPage() {
  const router = useRouter()
  const { user, settings } = useAppStore()
  const [reels, setReels] = useState<Reel[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadReels()
  }, [])

  const loadReels = async () => {
    setIsLoading(true)
    try {
      // Mock reels data
      const mockReels: Reel[] = Array.from({ length: 10 }, (_, i) => ({
        id: `reel-${i + 1}`,
        companyId: `company-${i + 1}`,
        companyName: `Company ${i + 1}`,
        description: `Check out our amazing product! Perfect for B2B wholesale. #business #wholesale #b2b #trending`,
        productId: `product-${i + 1}`,
        productName: `Product ${i + 1}`,
        likes: Math.floor(Math.random() * 10000),
        comments: Math.floor(Math.random() * 500),
        shares: Math.floor(Math.random() * 200),
        views: Math.floor(Math.random() * 50000),
        isLiked: false,
        isSaved: false,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }))
      setReels(mockReels)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = (reelId: string) => {
    setReels(reels.map(reel => {
      if (reel.id === reelId) {
        return {
          ...reel,
          isLiked: !reel.isLiked,
          likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1
        }
      }
      return reel
    }))
  }

  const handleSave = (reelId: string) => {
    setReels(reels.map(reel => {
      if (reel.id === reelId) {
        return { ...reel, isSaved: !reel.isSaved }
      }
      return reel
    }))
  }

  const handleShare = async (reel: Reel) => {
    if (navigator.share) {
      await navigator.share({
        title: reel.companyName,
        text: reel.description,
        url: `/reels/${reel.id}`
      })
    }
  }

  const goToNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const currentReel = reels[currentIndex]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading Reels...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black overflow-hidden relative" ref={containerRef}>
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={() => router.back()}
          className="p-2 text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">Reels</h1>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 text-white hover:bg-white/20 transition-colors"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </header>

      {/* Reel Content */}
      {currentReel && (
        <div className="h-full relative">
          {/* Video/Image Placeholder */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {/* Placeholder pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }} />
            </div>
            
            {/* Play/Pause indicator */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
              </div>
            )}

            {/* Product Tag */}
            {currentReel.productName && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/products/${currentReel.productId}`)
                }}
                className="absolute bottom-32 left-4 right-20 bg-white/90 text-black p-3 flex items-center gap-3 border-4 border-black"
              >
                <div className="w-12 h-12 bg-black/10 flex items-center justify-center border-2 border-black flex-shrink-0">
                  <Eye className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-bold truncate">{currentReel.productName}</p>
                  <p className="text-sm text-gray-600">View Product</p>
                </div>
              </button>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="absolute right-4 bottom-40 flex flex-col items-center gap-5 z-20">
            {/* Company Profile */}
            <button
              onClick={() => router.push(`/company/${currentReel.companyId}`)}
              className="relative"
            >
              <div className="w-12 h-12 rounded-full border-4 border-white bg-primary flex items-center justify-center overflow-hidden">
                {currentReel.companyLogo ? (
                  <img src={currentReel.companyLogo} alt={currentReel.companyName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-primary-foreground" />
                )}
              </div>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-xs text-primary-foreground font-bold">+</span>
              </span>
            </button>

            {/* Like */}
            <button
              onClick={() => handleLike(currentReel.id)}
              className="flex flex-col items-center"
            >
              <div className={`p-2 rounded-full ${currentReel.isLiked ? "text-red-500" : "text-white"}`}>
                <Heart className={`w-8 h-8 ${currentReel.isLiked ? "fill-current" : ""}`} />
              </div>
              <span className="text-white text-xs font-bold">{formatNumber(currentReel.likes)}</span>
            </button>

            {/* Comments */}
            <button
              onClick={() => setShowComments(true)}
              className="flex flex-col items-center"
            >
              <div className="p-2 text-white">
                <MessageCircle className="w-8 h-8" />
              </div>
              <span className="text-white text-xs font-bold">{formatNumber(currentReel.comments)}</span>
            </button>

            {/* Share */}
            <button
              onClick={() => handleShare(currentReel)}
              className="flex flex-col items-center"
            >
              <div className="p-2 text-white">
                <Share2 className="w-8 h-8" />
              </div>
              <span className="text-white text-xs font-bold">{formatNumber(currentReel.shares)}</span>
            </button>

            {/* Save */}
            <button
              onClick={() => handleSave(currentReel.id)}
              className="flex flex-col items-center"
            >
              <div className={`p-2 ${currentReel.isSaved ? "text-primary" : "text-white"}`}>
                <Bookmark className={`w-8 h-8 ${currentReel.isSaved ? "fill-current" : ""}`} />
              </div>
            </button>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-24 left-4 right-20 z-20">
            <button
              onClick={() => router.push(`/company/${currentReel.companyId}`)}
              className="font-bold text-white mb-2 hover:underline"
            >
              @{currentReel.companyName}
            </button>
            <p className="text-white text-sm leading-relaxed line-clamp-3">
              {currentReel.description}
            </p>
            <div className="flex items-center gap-2 mt-2 text-white/70 text-xs">
              <Eye className="w-4 h-4" />
              <span>{formatNumber(currentReel.views)} views</span>
            </div>
          </div>

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute top-1/2 -translate-y-1/2 left-4 z-20 p-2 bg-white/20 text-white hover:bg-white/30 transition-colors hidden md:block"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
          )}
          {currentIndex < reels.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute top-1/2 -translate-y-1/2 right-20 z-20 p-2 bg-white/20 text-white hover:bg-white/30 transition-colors hidden md:block"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          )}

          {/* Progress Bar */}
          <div className="absolute top-16 left-4 right-4 z-30 flex gap-1">
            {reels.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 transition-colors ${
                  index === currentIndex ? "bg-white" : index < currentIndex ? "bg-white/70" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Swipe Detection */}
      <div
        className="absolute inset-0 z-10"
        onTouchStart={(e) => {
          const touch = e.touches[0]
          const startY = touch.clientY
          
          const handleTouchEnd = (endEvent: TouchEvent) => {
            const endY = endEvent.changedTouches[0].clientY
            const diff = startY - endY
            
            if (Math.abs(diff) > 50) {
              if (diff > 0) goToNext()
              else goToPrevious()
            }
            
            document.removeEventListener("touchend", handleTouchEnd)
          }
          
          document.addEventListener("touchend", handleTouchEnd)
        }}
      />

      {/* Comments Modal */}
      {showComments && currentReel && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowComments(false)} />
          <div className="relative w-full max-h-[70vh] bg-card border-t-4 border-foreground flex flex-col">
            <div className="p-4 border-b-4 border-foreground flex items-center justify-between">
              <h3 className="font-bold text-lg">{formatNumber(currentReel.comments)} Comments</h3>
              <button onClick={() => setShowComments(false)} className="p-2 hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted border-2 border-foreground flex-shrink-0 flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">User {i + 1}</p>
                    <p className="text-sm text-muted-foreground">Great product! Would love to know more about wholesale pricing.</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{i + 1}h ago</span>
                      <button className="hover:text-foreground">Reply</button>
                      <button className="hover:text-foreground flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {Math.floor(Math.random() * 50)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t-4 border-foreground flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                className="brutalist-input flex-1"
              />
              <button className="brutalist-btn px-4">
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav userType={user?.role === "salesman" || user?.role === "viewer" ? "salesman" : "company"} />

      {/* AI Chat FAB - Hidden on reels for cleaner view */}
    </div>
  )
}
