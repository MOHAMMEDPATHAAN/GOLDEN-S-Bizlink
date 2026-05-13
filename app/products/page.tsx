"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Grid, List, Plus, Package, Heart, Eye, MoreVertical, Edit2, Trash2, Share2, ChevronDown, X, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import { products as productsDb, companies, auth } from "@/lib/db"
import type { Product, Company } from "@/lib/types"
import { BottomNav } from "@/components/bottom-nav"

const CATEGORIES = ["All", "Electronics", "Textiles", "Machinery", "Food & Beverage", "Chemicals", "Construction", "Robotics", "Automation", "Materials"]
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "views", label: "Most Viewed" },
  { value: "likes", label: "Most Liked" },
]

interface ProductWithCompany extends Product { company?: Company }

export default function ProductsPage() {
  const router = useRouter()
  const { user, setUser, company, setCompany, selectedRole } = useAppStore()
  const [products, setProducts] = useState<ProductWithCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set())

  useEffect(() => {
    const init = async () => {
      const { user: sessionUser } = await auth.getSession()
      if (!sessionUser) { router.push('/auth'); return }
      setUser(sessionUser)
      const comp = await companies.getByOwner(sessionUser.id)
      if (comp) setCompany(comp)
      
      // Load products (for company owners, load their products; for others, load all)
      const allProducts = await productsDb.list(comp?.id)
      const withCompanies = await Promise.all(
        allProducts.map(async (p) => {
          const c = await companies.get(p.company_id)
          return { ...p, company: c || undefined }
        })
      )
      setProducts(withCompanies)
      setIsLoading(false)
    }
    init()
  }, [router, setUser, setCompany])

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "views": return b.views - a.views
        case "likes": return b.likes - a.likes
        default: return 0
      }
    })

  const handleDelete = async (id: string) => {
    if (confirm("Delete this product?")) {
      await productsDb.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    }
    setActiveMenu(null)
  }

  const toggleLike = (id: string) => {
    setLikedProducts(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    productsDb.toggleLike(id)
  }

  const ProductCard = ({ product }: { product: ProductWithCompany }) => {
    const isOwner = product.company_id === company?.id
    const isLiked = likedProducts.has(product.id)

    return (
      <div className={cn("brutalist-card overflow-hidden", viewMode === "list" && "flex")}>
        <div 
          className={cn("bg-muted flex items-center justify-center cursor-pointer relative", viewMode === "list" ? "w-20 h-20 flex-shrink-0" : "aspect-square")}
          onClick={() => router.push(`/seeproduct/${product.id}`)}
        >
          {product.images?.[0] ? (
            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <Package className="w-8 h-8 text-muted-foreground" />
          )}
          {!isOwner && (
            <button onClick={(e) => { e.stopPropagation(); toggleLike(product.id) }} className={cn("absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center border-2 border-foreground bg-background active:scale-90 transition-transform", isLiked && "bg-red-500 text-white")}>
              <Heart className={cn("w-3.5 h-3.5", isLiked && "fill-current")} />
            </button>
          )}
        </div>

        <div className="p-2 flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/seeproduct/${product.id}`)}>
              <p className="font-bold text-xs truncate">{product.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{product.company?.name || product.category}</p>
            </div>
            
            {isOwner && (
              <div className="relative">
                <button onClick={() => setActiveMenu(activeMenu === product.id ? null : product.id)} className="p-1 hover:bg-muted active:scale-95 transition-all">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
                {activeMenu === product.id && (
                  <div className="absolute right-0 top-full mt-0.5 w-28 bg-card border-2 border-foreground z-20 shadow-brutal">
                    <button onClick={() => { router.push(`/products/${product.id}/edit`); setActiveMenu(null) }} className="w-full p-1.5 flex items-center gap-1.5 hover:bg-muted text-xs active:scale-98 transition-all">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => { navigator.share?.({ title: product.name, url: `/seeproduct/${product.id}` }); setActiveMenu(null) }} className="w-full p-1.5 flex items-center gap-1.5 hover:bg-muted text-xs active:scale-98 transition-all">
                      <Share2 className="w-3 h-3" /> Share
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="w-full p-1.5 flex items-center gap-1.5 hover:bg-destructive/10 text-destructive text-xs active:scale-98 transition-all">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{product.views}</span>
            <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" />{product.likes}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b-4 border-foreground sticky top-0 z-40">
        <div className="flex items-center justify-between p-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted border-2 border-transparent hover:border-foreground active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold">Products</h1>
          <button onClick={() => router.push("/add")} className="p-2 bg-primary border-2 border-foreground active:scale-95 transition-transform">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="brutalist-input w-full pl-8 pr-8 py-2 text-sm" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 active:scale-90 transition-transform">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex items-center justify-between px-3 pb-2 border-t-2 border-foreground pt-2">
          <button onClick={() => setShowFilters(!showFilters)} className={cn("flex items-center gap-1.5 px-2.5 py-1.5 border-2 text-xs font-bold transition-all active:scale-95", showFilters ? "border-primary bg-primary/10" : "border-foreground hover:bg-muted")}>
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
          </button>

          <div className="flex items-center gap-1.5">
            {/* Sort */}
            <div className="relative">
              <button onClick={() => setShowSortMenu(!showSortMenu)} className="flex items-center gap-1 px-2.5 py-1.5 border-2 border-foreground text-xs font-bold hover:bg-muted active:scale-95 transition-all">
                Sort <ChevronDown className="w-3 h-3" />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-0.5 w-32 bg-card border-2 border-foreground z-20 shadow-brutal">
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSortMenu(false) }} className={cn("w-full p-1.5 text-left text-xs hover:bg-muted active:scale-98 transition-all", sortBy === opt.value && "bg-primary/10 text-primary")}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex border-2 border-foreground">
              <button onClick={() => setViewMode("grid")} className={cn("p-1.5 active:scale-95 transition-all", viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode("list")} className={cn("p-1.5 active:scale-95 transition-all", viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        {showFilters && (
          <div className="px-3 pb-3 border-t-2 border-foreground pt-2">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={cn("px-2 py-1 text-[10px] border-2 font-bold active:scale-95 transition-all", selectedCategory === cat ? "border-primary bg-primary text-primary-foreground" : "border-foreground hover:bg-muted")}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Products */}
      <div className="p-3">
        {isLoading ? (
          <div className={cn(viewMode === "grid" ? "grid grid-cols-2 gap-2" : "space-y-2")}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="brutalist-card overflow-hidden">
                <div className={cn("skeleton-gold", viewMode === "list" ? "w-20 h-20" : "aspect-square")} />
                <div className="p-2 space-y-1.5">
                  <div className="h-3 skeleton-gold w-3/4" />
                  <div className="h-2 skeleton-gold w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-bold text-sm">No Products Found</h3>
            <p className="text-xs text-muted-foreground mb-3">{searchQuery ? "Try different keywords" : "Add your first product"}</p>
            <button onClick={() => router.push("/add")} className="brutalist-btn text-sm py-2 px-4 active:scale-95 transition-transform">
              <Plus className="w-4 h-4 inline mr-1" /> Add Product
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-2">{filteredProducts.length} products</p>
            <div className={cn(viewMode === "grid" ? "grid grid-cols-2 gap-2" : "space-y-2")}>
              {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </>
        )}
      </div>

      {/* Click outside to close menus */}
      {(activeMenu || showSortMenu) && <div className="fixed inset-0 z-10" onClick={() => { setActiveMenu(null); setShowSortMenu(false) }} />}

      <BottomNav variant={selectedRole === 'salesman' || selectedRole === 'viewer' ? 'salesman' : 'company'} />
    </div>
  )
}
