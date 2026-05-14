"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX, Play, Building2, Eye, X, ChevronUp, ChevronDown, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import { BottomNav } from "@/components/bottom-nav"
import { reels as reelsDb, auth } from "@/lib/db"
import type { Reel, Company } from "@/lib/types"

interface ReelWithCompany extends Reel {
  company?: Company
}

export default function ReelsPage() {
  const router = useRouter()
  const { user, setUser, selectedRole } = useAppStore()
  const [reelsList, setReelsList] = useState<ReelWithCompany[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set())
  const [savedReels, setSavedReels] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)

  useEffect(() => {
    const init = async () => {
      const { user: sessionUser } = await auth.getSession()
      if (!sessionUser) { router.push('/auth'); return }
      setUser(sessionUser)
      
      // db.ts joins company data — no extra fetch needed
      const allReels = await reelsDb.list()
      setReelsList(allReels as ReelWithCompany[])
      setIsLoading(false)
    }
    init()
  }, [router, setUser])

  const navigate = useCallback((dir: 'up' | 'down') => {
    if (dir === 'down' && currentIndex < reelsList.length - 1) {
      setCurrentIndex(i => i + 1)
    } else if (dir === 'up' && currentIndex > 0) {
      setCurrentIndex(i => i - 1)
    }
  }, [currentIndex, reelsList.length])

  const handleLike = (id: string) => {
    setLikedReels(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else { next.add(id); reelsDb.toggleLike(id) }
      return next
    })
    setReelsList(prev => prev.map(r => r.id === id ? { ...r, likes: likedReels.has(id) ? r.likes - 1 : r.likes + 1 } : r))
  }

  const handleSave = (id: string) => {
    setSavedReels(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleShare = async (reel: ReelWithCompany) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: reel.title, text: reel.description, url: window.location.href })
      } catch {}
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') navigate('down')
      if (e.key === 'ArrowUp') navigate('up')
      if (e.key === ' ') { e.preventDefault(); setIsPlaying(p => !p) }
      if (e.key === 'm') setIsMuted(m => !m)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY }
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY
    if (Math.abs(diff) > 50) navigate(diff > 0 ? 'down' : 'up')
  }

  const fmt = (n: number) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : String(n)

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (reelsList.length === 0) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center p-4 pb-20">
        <div className="w-14 h-14 border-4 border-foreground bg-muted flex items-center justify-center mb-4">
          <Play className="w-6 h-6" />
        </div>
        <h2 className="font-bold text-lg mb-1">No Reels Yet</h2>
        <p className="text-muted-foreground text-sm mb-4">Be the first to upload!</p>
        <button onClick={() => router.push('/add')} className="brutalist-btn text-sm py-2 px-4">
          Create Reel
        </button>
        <BottomNav variant={selectedRole === 'salesman' || selectedRole === 'viewer' ? 'salesman' : 'company'} />
      </div>
    )
  }

  const current = reelsList[currentIndex]
  const isLiked = likedReels.has(current.id)
  const isSaved = savedReels.has(current.id)

  return (
    <div ref={containerRef} className="h-screen bg-black overflow-hidden relative" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Video/Placeholder */}
      <div className="absolute inset-0" onClick={() => setIsPlaying(p => !p)}>
        {current.video_url ? (
          <video src={current.video_url} className="w-full h-full object-cover" autoPlay={isPlaying} loop muted={isMuted} playsInline />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-black to-black flex items-center justify-center">
            <div className="text-center text-white/70">
              <Building2 className="w-12 h-12 mx-auto mb-2" />
              <p className="font-bold">{current.title}</p>
              <p className="text-sm">{current.company?.name}</p>
            </div>
          </div>
        )}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur flex items-center justify-center">
              <Play className="w-7 h-7 text-white ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

      {/* Progress dots */}
      <div className="absolute top-12 left-3 right-3 flex gap-0.5 z-30">
        {reelsList.map((_, i) => (
          <div key={i} className={cn("h-0.5 flex-1 rounded-full", i === currentIndex ? "bg-white" : i < currentIndex ? "bg-white/60" : "bg-white/25")} />
        ))}
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between z-30 safe-top">
        <h1 className="text-white font-bold">Reels</h1>
        <div className="flex gap-2">
          <button onClick={() => setIsMuted(m => !m)} className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center active:scale-95 transition-transform">
            {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>

      {/* Nav arrows */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
        <button onClick={() => navigate('up')} disabled={currentIndex === 0} className={cn("w-9 h-9 rounded-full bg-black/40 flex items-center justify-center active:scale-95 transition-transform", currentIndex === 0 && "opacity-30")}>
          <ChevronUp className="w-5 h-5 text-white" />
        </button>
        <button onClick={() => navigate('down')} disabled={currentIndex === reelsList.length - 1} className={cn("w-9 h-9 rounded-full bg-black/40 flex items-center justify-center active:scale-95 transition-transform", currentIndex === reelsList.length - 1 && "opacity-30")}>
          <ChevronDown className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Side actions */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-4 z-20">
        {/* Company avatar */}
        <button onClick={() => router.push(`/seeprofile/${current.company_id}`)} className="mb-2">
          <div className="w-10 h-10 rounded-full border-2 border-white bg-primary/80 flex items-center justify-center overflow-hidden">
            {current.company?.logo_url ? <img src={current.company.logo_url} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-5 h-5 text-white" />}
          </div>
        </button>

        {/* Like */}
        <button onClick={() => handleLike(current.id)} className="flex flex-col items-center active:scale-95 transition-transform">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", isLiked ? "bg-red-500" : "bg-black/40")}>
            <Heart className={cn("w-5 h-5 text-white", isLiked && "fill-white")} />
          </div>
          <span className="text-white text-[10px] mt-0.5 font-medium">{fmt(current.likes)}</span>
        </button>

        {/* Comments */}
        <button onClick={() => setShowComments(true)} className="flex flex-col items-center active:scale-95 transition-transform">
          <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-[10px] mt-0.5 font-medium">{fmt(current.comments_count)}</span>
        </button>

        {/* Share */}
        <button onClick={() => handleShare(current)} className="flex flex-col items-center active:scale-95 transition-transform">
          <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-[10px] mt-0.5 font-medium">{fmt(current.shares)}</span>
        </button>

        {/* Save */}
        <button onClick={() => handleSave(current.id)} className="flex flex-col items-center active:scale-95 transition-transform">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", isSaved ? "bg-primary" : "bg-black/40")}>
            <Bookmark className={cn("w-5 h-5 text-white", isSaved && "fill-white")} />
          </div>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-20 left-3 right-16 z-20">
        <button onClick={() => router.push(`/seeprofile/${current.company_id}`)} className="flex items-center gap-2 mb-2">
          <span className="text-white font-bold text-sm">@{current.company?.name || 'Company'}</span>
        </button>
        <h3 className="text-white font-bold text-sm mb-0.5">{current.title}</h3>
        {current.description && <p className="text-white/80 text-xs line-clamp-2">{current.description}</p>}
        <div className="flex items-center gap-2 mt-1.5 text-white/60 text-[10px]">
          <Eye className="w-3 h-3" />
          <span>{fmt(current.views)} views</span>
        </div>
        {current.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {current.tags.slice(0, 4).map(tag => <span key={tag} className="text-white/50 text-[10px]">#{tag}</span>)}
          </div>
        )}
      </div>

      {/* Counter */}
      <div className="absolute top-3 right-3 z-30 safe-top">
        <span className="text-white/60 text-[10px] font-medium">{currentIndex + 1}/{reelsList.length}</span>
      </div>

      {/* Comments modal */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowComments(false)} />
          <div className="relative w-full max-h-[65vh] bg-card border-t-4 border-foreground flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="p-3 border-b-2 border-muted flex items-center justify-between">
              <h3 className="font-bold text-sm">{fmt(current.comments_count)} Comments</h3>
              <button onClick={() => setShowComments(false)} className="p-1.5 hover:bg-muted rounded active:scale-95 transition-transform">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <MessageCircle className="w-8 h-8 opacity-30" />
              <p className="text-sm font-bold">No comments yet</p>
              <p className="text-xs">Be the first to comment.</p>
            </div>
            <div className="p-3 border-t-2 border-muted flex gap-2">
              <input type="text" placeholder="Add a comment..." className="brutalist-input flex-1 py-2 text-sm" />
              <button className="brutalist-btn px-3 py-2"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}

      <BottomNav variant={selectedRole === 'salesman' || selectedRole === 'viewer' ? 'salesman' : 'company'} />
    </div>
  )
}
