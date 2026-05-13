"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, MoreVertical, User, MapPin, Clock, Package, Building2, Eye, Send, X, Image as ImageIcon } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { BottomNav } from "@/components/bottom-nav"
import { AIChatFab } from "@/components/ai-chat-fab"
import { AppHeader } from "@/components/app-header"

interface FeedPost {
  id: string
  companyId: string
  companyName: string
  companyLogo?: string
  companyLocation: string
  type: "product" | "update" | "announcement"
  content: string
  images: string[]
  productId?: string
  productName?: string
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  isSaved: boolean
  createdAt: string
}

export default function FeedPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activePostMenu, setActivePostMenu] = useState<string | null>(null)
  const [showComments, setShowComments] = useState<string | null>(null)

  useEffect(() => {
    loadFeed()
  }, [])

  const loadFeed = async () => {
    setIsLoading(true)
    try {
      // Mock feed data
      const mockPosts: FeedPost[] = Array.from({ length: 10 }, (_, i) => ({
        id: `post-${i + 1}`,
        companyId: `company-${i + 1}`,
        companyName: `Company ${i + 1}`,
        companyLocation: ["New York, USA", "Dubai, UAE", "Mumbai, India", "London, UK", "Tokyo, Japan"][i % 5],
        type: (["product", "update", "announcement"] as const)[i % 3],
        content: i % 3 === 0 
          ? `Excited to announce our latest product launch! Check out our new ${["Electronics", "Textiles", "Machinery"][i % 3]} line designed specifically for B2B partners. Contact us for wholesale pricing and bulk orders.`
          : i % 3 === 1
          ? `We've just expanded our production capacity by 50%! Now taking larger orders with faster turnaround times. Let's connect!`
          : `Important update: Our annual B2B trade show is coming up next month. Book your spot now for exclusive early-bird discounts!`,
        images: i % 2 === 0 ? [] : [],
        productId: i % 3 === 0 ? `product-${i + 1}` : undefined,
        productName: i % 3 === 0 ? `Product ${i + 1}` : undefined,
        likes: Math.floor(Math.random() * 500),
        comments: Math.floor(Math.random() * 50),
        shares: Math.floor(Math.random() * 30),
        isLiked: false,
        isSaved: false,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }))
      setPosts(mockPosts)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        }
      }
      return post
    }))
  }

  const handleSave = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, isSaved: !post.isSaved }
      }
      return post
    }))
  }

  const handleShare = async (post: FeedPost) => {
    if (navigator.share) {
      await navigator.share({
        title: post.companyName,
        text: post.content,
        url: `/feed/${post.id}`
      })
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    if (hours < 48) return "Yesterday"
    return `${Math.floor(hours / 24)}d ago`
  }

  const PostCard = ({ post }: { post: FeedPost }) => (
    <div className="brutalist-card overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <button
          onClick={() => router.push(`/company/${post.companyId}`)}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full border-4 border-foreground bg-primary flex items-center justify-center overflow-hidden">
            {post.companyLogo ? (
              <img src={post.companyLogo} alt={post.companyName} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-6 h-6 text-primary-foreground" />
            )}
          </div>
          <div className="text-left">
            <p className="font-bold">{post.companyName}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {post.companyLocation}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(post.createdAt)}
          </span>
          <div className="relative">
            <button
              onClick={() => setActivePostMenu(activePostMenu === post.id ? null : post.id)}
              className="p-2 hover:bg-muted transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {activePostMenu === post.id && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-card border-4 border-foreground z-20">
                <button className="w-full p-3 flex items-center gap-2 hover:bg-muted text-sm text-left">
                  Report
                </button>
                <button className="w-full p-3 flex items-center gap-2 hover:bg-muted text-sm text-left">
                  Not interested
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Type Badge */}
      {post.type !== "update" && (
        <div className="px-4 pb-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold uppercase ${
            post.type === "product" ? "bg-primary/20 text-primary" : "bg-blue-500/20 text-blue-600"
          }`}>
            {post.type === "product" ? (
              <>
                <Package className="w-3 h-3" />
                New Product
              </>
            ) : (
              <>
                <Building2 className="w-3 h-3" />
                Announcement
              </>
            )}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Images */}
      {post.images.length > 0 && (
        <div className={`border-t-4 border-foreground grid ${
          post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
        } gap-0.5`}>
          {post.images.slice(0, 4).map((image, index) => (
            <div key={index} className="aspect-square bg-muted relative">
              <img src={image} alt="" className="w-full h-full object-cover" />
              {index === 3 && post.images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold">
                  +{post.images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Placeholder for posts without images */}
      {post.images.length === 0 && post.type === "product" && (
        <div className="border-t-4 border-foreground bg-muted aspect-video flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Product Image</p>
          </div>
        </div>
      )}

      {/* Product Link */}
      {post.productId && (
        <button
          onClick={() => router.push(`/products/${post.productId}`)}
          className="w-full p-3 bg-muted border-t-4 border-foreground flex items-center gap-3 hover:bg-muted/80 transition-colors"
        >
          <div className="w-10 h-10 bg-card border-2 border-foreground flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm">{post.productName}</p>
            <p className="text-xs text-muted-foreground">View Product Details</p>
          </div>
          <Eye className="w-5 h-5 text-muted-foreground" />
        </button>
      )}

      {/* Actions */}
      <div className="p-4 border-t-4 border-foreground flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleLike(post.id)}
            className={`flex items-center gap-1 ${post.isLiked ? "text-red-500" : ""}`}
          >
            <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
            <span className="text-sm font-bold">{post.likes}</span>
          </button>

          <button
            onClick={() => setShowComments(post.id)}
            className="flex items-center gap-1"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-bold">{post.comments}</span>
          </button>

          <button
            onClick={() => handleShare(post)}
            className="flex items-center gap-1"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-bold">{post.shares}</span>
          </button>
        </div>

        <button
          onClick={() => handleSave(post.id)}
          className={post.isSaved ? "text-primary" : ""}
        >
          <Bookmark className={`w-5 h-5 ${post.isSaved ? "fill-current" : ""}`} />
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <AppHeader title="Feed" showBack />

      {/* Feed Content */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="brutalist-card p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full skeleton-gold" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton-gold w-32" />
                  <div className="h-3 skeleton-gold w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 skeleton-gold w-full" />
                <div className="h-4 skeleton-gold w-3/4" />
              </div>
              <div className="h-40 skeleton-gold" />
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-bold text-lg">No Posts Yet</h3>
            <p className="text-muted-foreground">Follow companies to see their updates here</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>

      {/* Click outside to close menus */}
      {activePostMenu && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setActivePostMenu(null)}
        />
      )}

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowComments(null)} />
          <div className="relative w-full max-w-lg max-h-[80vh] bg-card border-4 border-foreground flex flex-col">
            <div className="p-4 border-b-4 border-foreground flex items-center justify-between">
              <h3 className="font-bold text-lg">Comments</h3>
              <button onClick={() => setShowComments(null)} className="p-2 hover:bg-muted">
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
                    <p className="text-sm text-muted-foreground">This is a great post! Would love to learn more about your products.</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{i + 1}h ago</span>
                      <button className="hover:text-foreground">Reply</button>
                      <button className="hover:text-foreground flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {Math.floor(Math.random() * 20)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t-4 border-foreground flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                className="brutalist-input flex-1"
              />
              <button className="brutalist-btn px-4">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav userType={user?.role === "salesman" || user?.role === "viewer" ? "salesman" : "company"} />

      {/* AI Chat FAB */}
      <AIChatFab />
    </div>
  )
}
