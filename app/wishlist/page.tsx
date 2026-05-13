"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, Trash2, Package, Building2, Share2, ShoppingCart, X, Grid, List } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { BottomNav } from "@/components/bottom-nav"
import { AIChatFab } from "@/components/ai-chat-fab"

interface WishlistItem {
  id: string
  productId: string
  productName: string
  productImage?: string
  companyId: string
  companyName: string
  priceRange: {
    min: number
    max: number
    currency: string
  }
  addedAt: string
}

export default function WishlistPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    setIsLoading(true)
    try {
      // Mock wishlist data
      const mockItems: WishlistItem[] = Array.from({ length: 6 }, (_, i) => ({
        id: `wishlist-${i + 1}`,
        productId: `product-${i + 1}`,
        productName: `Product ${i + 1}`,
        companyId: `company-${i + 1}`,
        companyName: `Company ${i + 1}`,
        priceRange: {
          min: Math.floor(Math.random() * 100 + 10),
          max: Math.floor(Math.random() * 500 + 100),
          currency: "USD",
        },
        addedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      }))
      setItems(mockItems)
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const removeSelected = () => {
    setItems(items.filter(item => !selectedItems.has(item.id)))
    setSelectedItems(new Set())
    setIsSelecting(false)
  }

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedItems(newSelection)
  }

  const handleShare = async (item: WishlistItem) => {
    if (navigator.share) {
      await navigator.share({
        title: item.productName,
        text: `Check out ${item.productName} from ${item.companyName}`,
        url: `/products/${item.productId}`
      })
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const ItemCard = ({ item }: { item: WishlistItem }) => (
    <div 
      className={`brutalist-card overflow-hidden ${viewMode === "list" ? "flex" : ""}`}
      onClick={() => isSelecting ? toggleSelection(item.id) : router.push(`/products/${item.productId}`)}
    >
      {isSelecting && (
        <div className={`absolute top-2 left-2 w-6 h-6 border-2 border-foreground z-10 flex items-center justify-center ${
          selectedItems.has(item.id) ? "bg-primary" : "bg-background"
        }`}>
          {selectedItems.has(item.id) && <span className="text-primary-foreground font-bold">✓</span>}
        </div>
      )}

      <div className={`bg-muted flex items-center justify-center relative ${
        viewMode === "list" ? "w-24 h-24 flex-shrink-0" : "aspect-square"
      }`}>
        {item.productImage ? (
          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-12 h-12 text-muted-foreground" />
        )}
        
        {!isSelecting && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeItem(item.id)
            }}
            className="absolute top-2 right-2 p-1.5 bg-card border-2 border-foreground hover:bg-destructive/10 transition-colors"
          >
            <Heart className="w-4 h-4 text-red-500 fill-current" />
          </button>
        )}
      </div>

      <div className="p-3 flex-1">
        <h3 className="font-bold text-sm truncate">{item.productName}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/company/${item.companyId}`)
          }}
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          <Building2 className="w-3 h-3" />
          {item.companyName}
        </button>
        
        <p className="text-sm font-bold text-primary mt-2">
          {item.priceRange.currency} {item.priceRange.min} - {item.priceRange.max}
        </p>

        {viewMode === "list" && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/chat?company=${item.companyId}`)
              }}
              className="text-xs px-2 py-1 border-2 border-foreground hover:bg-muted"
            >
              Contact
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleShare(item)
              }}
              className="p-1 hover:bg-muted"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
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
          <h1 className="text-xl font-bold">Wishlist</h1>
          <div className="flex items-center gap-2">
            {isSelecting ? (
              <>
                <button
                  onClick={removeSelected}
                  disabled={selectedItems.size === 0}
                  className="p-2 hover:bg-destructive/10 text-destructive disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsSelecting(false)
                    setSelectedItems(new Set())
                  }}
                  className="p-2 hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsSelecting(true)}
                  className="p-2 hover:bg-muted"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="flex border-2 border-foreground">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className={`${viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-3"}`}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="brutalist-card overflow-hidden">
                <div className={`skeleton-gold ${viewMode === "list" ? "w-24 h-24" : "aspect-square"}`} />
                <div className="p-3 space-y-2">
                  <div className="h-4 skeleton-gold w-3/4" />
                  <div className="h-3 skeleton-gold w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-bold text-lg">Your Wishlist is Empty</h3>
            <p className="text-muted-foreground mb-4">Save products you like to view them later</p>
            <button
              onClick={() => router.push("/home")}
              className="brutalist-btn"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-3">
              {items.length} item{items.length !== 1 ? "s" : ""} saved
            </p>
            <div className={`${viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-3"}`}>
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav userType={user?.role === "salesman" || user?.role === "viewer" ? "salesman" : "company"} />

      {/* AI Chat FAB */}
      <AIChatFab />
    </div>
  )
}
