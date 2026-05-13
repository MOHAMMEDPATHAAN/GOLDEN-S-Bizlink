"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Filter, Grid, List, Plus, Package, Heart, Eye, MoreVertical, Edit2, Trash2, Share2, ChevronDown, X, SlidersHorizontal } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { db } from "@/lib/db"
import { Product } from "@/lib/types"
import { BottomNav } from "@/components/bottom-nav"
import { AIChatFab } from "@/components/ai-chat-fab"

const CATEGORIES = [
  "All",
  "Electronics",
  "Textiles",
  "Machinery",
  "Food & Beverage",
  "Chemicals",
  "Construction",
  "Automotive",
  "Healthcare",
  "Agriculture",
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "views", label: "Most Viewed" },
  { value: "likes", label: "Most Liked" },
]

export default function ProductsPage() {
  const router = useRouter()
  const { user, company } = useAppStore()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [activeProductMenu, setActiveProductMenu] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      // Mock products data
      const mockProducts: Product[] = Array.from({ length: 12 }, (_, i) => ({
        id: `product-${i + 1}`,
        companyId: company?.id || "company-1",
        name: `Product ${i + 1}`,
        description: `High-quality product for B2B wholesale. Perfect for bulk orders and distribution partnerships.`,
        category: CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1)) + 1],
        images: [],
        specifications: {
          material: "Premium Grade",
          weight: `${Math.floor(Math.random() * 10 + 1)} kg`,
          dimensions: "30x20x10 cm",
        },
        minOrderQty: Math.floor(Math.random() * 100 + 10),
        priceRange: {
          min: Math.floor(Math.random() * 100 + 10),
          max: Math.floor(Math.random() * 500 + 100),
          currency: "USD",
        },
        tags: ["wholesale", "bulk", "b2b"],
        isActive: true,
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 100),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      }))
      setProducts(mockProducts)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "name_asc":
          return a.name.localeCompare(b.name)
        case "name_desc":
          return b.name.localeCompare(a.name)
        case "views":
          return (b.views || 0) - (a.views || 0)
        case "likes":
          return (b.likes || 0) - (a.likes || 0)
        default:
          return 0
      }
    })

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== productId))
    }
    setActiveProductMenu(null)
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <div className={`brutalist-card overflow-hidden ${viewMode === "list" ? "flex" : ""}`}>
      {/* Image */}
      <div 
        className={`bg-muted flex items-center justify-center cursor-pointer ${
          viewMode === "list" ? "w-24 h-24 flex-shrink-0" : "aspect-square"
        }`}
        onClick={() => router.push(`/products/${product.id}`)}
      >
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-12 h-12 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div 
            className="flex-1 cursor-pointer"
            onClick={() => router.push(`/products/${product.id}`)}
          >
            <h3 className="font-bold text-sm truncate">{product.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{product.category}</p>
          </div>
          
          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveProductMenu(activeProductMenu === product.id ? null : product.id)}
              className="p-1 hover:bg-muted transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {activeProductMenu === product.id && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-card border-4 border-foreground z-20">
                <button
                  onClick={() => {
                    router.push(`/products/${product.id}/edit`)
                    setActiveProductMenu(null)
                  }}
                  className="w-full p-2 flex items-center gap-2 hover:bg-muted text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    navigator.share?.({ title: product.name, url: `/products/${product.id}` })
                    setActiveProductMenu(null)
                  }}
                  className="w-full p-2 flex items-center gap-2 hover:bg-muted text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="w-full p-2 flex items-center gap-2 hover:bg-destructive/10 text-destructive text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {product.views}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {product.likes}
          </span>
        </div>

        {/* Price Range */}
        {product.priceRange && (
          <p className="text-sm font-bold text-primary mt-2">
            {product.priceRange.currency} {product.priceRange.min} - {product.priceRange.max}
          </p>
        )}

        {/* MOQ */}
        <p className="text-xs text-muted-foreground mt-1">
          MOQ: {product.minOrderQty} units
        </p>
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
          <h1 className="text-xl font-bold">Products</h1>
          <button
            onClick={() => router.push("/add")}
            className="p-2 bg-primary border-2 border-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="brutalist-input w-full pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex items-center justify-between px-4 pb-3 border-t-2 border-foreground pt-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border-2 text-sm font-medium transition-colors ${
              showFilters ? "border-primary bg-primary/10" : "border-foreground hover:bg-muted"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-1 px-3 py-2 border-2 border-foreground text-sm font-medium hover:bg-muted transition-colors"
              >
                Sort
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-card border-4 border-foreground z-20">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value)
                        setShowSortMenu(false)
                      }}
                      className={`w-full p-2 text-left text-sm hover:bg-muted transition-colors ${
                        sortBy === option.value ? "bg-primary/10 text-primary" : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex border-2 border-foreground">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        {showFilters && (
          <div className="px-4 pb-4 border-t-2 border-foreground pt-3">
            <p className="text-sm font-bold mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-sm border-2 transition-colors ${
                    selectedCategory === category
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-foreground hover:bg-muted"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Products Grid/List */}
      <div className="p-4">
        {isLoading ? (
          <div className={`${viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-3"}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="brutalist-card overflow-hidden">
                <div className={`skeleton-gold ${viewMode === "list" ? "w-24 h-24" : "aspect-square"}`} />
                <div className="p-3 space-y-2">
                  <div className="h-4 skeleton-gold w-3/4" />
                  <div className="h-3 skeleton-gold w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-bold text-lg">No Products Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try a different search term" : "Add your first product to get started"}
            </p>
            <button
              onClick={() => router.push("/add")}
              className="brutalist-btn"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Product
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-3">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </p>
            <div className={`${viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-3"}`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Click outside to close menus */}
      {(activeProductMenu || showSortMenu) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setActiveProductMenu(null)
            setShowSortMenu(false)
          }}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav userType="company" />

      {/* AI Chat FAB */}
      <AIChatFab />
    </div>
  )
}
