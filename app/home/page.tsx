'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Star, Clock, ChevronRight, Building2, Package, Eye, Heart, Sparkles, Flame, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppHeader } from '@/components/app-header'
import { BottomNav } from '@/components/bottom-nav'
import { useAppStore } from '@/lib/store'
import { auth, products as productsDb, companies as companiesDb } from '@/lib/db'
import type { Product, Company } from '@/lib/types'

interface ProductWithCompany extends Product { company?: Company }

const CATEGORIES = [
  { name: 'All', icon: Package, color: 'bg-primary' },
  { name: 'Robotics', icon: Zap, color: 'bg-blue-500' },
  { name: 'Materials', icon: Building2, color: 'bg-amber-500' },
  { name: 'Automation', icon: Sparkles, color: 'bg-purple-500' },
]

export default function HomePage() {
  const router = useRouter()
  const { user, company, setUser, selectedRole } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [products, setProducts] = useState<ProductWithCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set())

  useEffect(() => {
    const init = async () => {
      const { user: sessionUser } = await auth.getSession()
      if (!sessionUser) { router.push('/auth'); return }
      setUser(sessionUser)
      const allProducts = await productsDb.list()
      const withCompanies = await Promise.all(
        allProducts.map(async (p) => {
          const comp = await companiesDb.get(p.company_id)
          return { ...p, company: comp || undefined }
        })
      )
      setProducts(withCompanies)
      setIsLoading(false)
    }
    init()
  }, [router, setUser])

  const filteredProducts = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory)
  const trendingProducts = products.filter(p => p.is_trending).slice(0, 4)
  const featuredProducts = products.filter(p => p.is_featured).slice(0, 4)

  const toggleLike = (id: string) => {
    setLikedProducts(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    productsDb.toggleLike(id)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />

      <main className="p-3 space-y-4">
        {/* Welcome Card - Compact */}
        <div className="brutalist-card p-3 golden-gradient">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 border-3 border-foreground bg-background flex items-center justify-center flex-shrink-0">
              {company?.logo_url ? (
                <img src={company.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">Welcome</p>
              <h2 className="font-black text-base truncate">{company?.name || user?.email?.split('@')[0] || 'User'}</h2>
            </div>
            <button onClick={() => router.push('/profile')} className="px-3 py-1.5 border-2 border-foreground bg-background font-bold text-xs hover:bg-accent active:scale-95 transition-all">
              Profile
            </button>
          </div>
        </div>

        {/* Quick Stats - More Compact */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Package, value: products.length, label: 'Products', color: 'text-primary' },
            { icon: Eye, value: '2.4K', label: 'Views', color: 'text-blue-500' },
            { icon: Heart, value: '156', label: 'Likes', color: 'text-red-500' },
          ].map((stat, i) => (
            <div key={i} className="brutalist-card p-2.5 text-center">
              <stat.icon className={cn("w-5 h-5 mx-auto mb-0.5", stat.color)} />
              <p className="text-lg font-black">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Categories - Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-hide">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            const isActive = selectedCategory === cat.name
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground font-bold text-xs whitespace-nowrap transition-all active:scale-95",
                  isActive ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.name}
              </button>
            )
          })}
        </div>

        {/* Trending Section */}
        {trendingProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-sm flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                Trending
              </h3>
              <button onClick={() => router.push('/explore?tab=trending')} className="text-xs font-bold text-primary flex items-center active:scale-95">
                See All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-hide">
              {trendingProducts.map(product => (
                <ProductCard key={product.id} product={product} isLiked={likedProducts.has(product.id)} onLike={() => toggleLike(product.id)} onClick={() => router.push(`/seeproduct/${product.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Section */}
        {featuredProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-sm flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-500" />
                Featured
              </h3>
              <button onClick={() => router.push('/explore?tab=featured')} className="text-xs font-bold text-primary flex items-center active:scale-95">
                See All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {featuredProducts.map(product => (
                <ProductCardGrid key={product.id} product={product} isLiked={likedProducts.has(product.id)} onLike={() => toggleLike(product.id)} onClick={() => router.push(`/seeproduct/${product.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* All Products */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-black text-sm flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-green-500" />
              All Products
            </h3>
            <span className="text-xs text-muted-foreground font-bold">{filteredProducts.length} items</span>
          </div>
          {filteredProducts.length === 0 ? (
            <div className="brutalist-card p-6 text-center">
              <Package className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
              <p className="font-bold text-sm">No products found</p>
              <p className="text-xs text-muted-foreground">Try a different category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredProducts.map(product => (
                <ProductCardGrid key={product.id} product={product} isLiked={likedProducts.has(product.id)} onLike={() => toggleLike(product.id)} onClick={() => router.push(`/seeproduct/${product.id}`)} />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav variant={selectedRole === 'salesman' || selectedRole === 'viewer' ? 'salesman' : 'company'} />
    </div>
  )
}

// Compact Product Card for Horizontal Scroll
function ProductCard({ product, isLiked, onLike, onClick }: { product: ProductWithCompany; isLiked: boolean; onLike: () => void; onClick: () => void }) {
  return (
    <div className="brutalist-card w-36 flex-shrink-0 overflow-hidden">
      <div className="relative aspect-square bg-muted" onClick={onClick}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-muted-foreground" /></div>
        )}
        <button onClick={(e) => { e.stopPropagation(); onLike() }} className={cn("absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center border-2 border-foreground bg-background active:scale-90 transition-transform", isLiked && "bg-red-500 text-white")}>
          <Heart className={cn("w-3.5 h-3.5", isLiked && "fill-current")} />
        </button>
        {product.is_trending && (
          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-orange-500 text-white text-[8px] font-bold border border-foreground">HOT</span>
        )}
      </div>
      <div className="p-2" onClick={onClick}>
        <p className="text-[10px] text-muted-foreground truncate">{product.company?.name}</p>
        <p className="font-bold text-xs truncate">{product.name}</p>
        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{product.views}</span>
          <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" />{product.likes}</span>
        </div>
      </div>
    </div>
  )
}

// Grid Product Card
function ProductCardGrid({ product, isLiked, onLike, onClick }: { product: ProductWithCompany; isLiked: boolean; onLike: () => void; onClick: () => void }) {
  return (
    <div className="brutalist-card overflow-hidden">
      <div className="relative aspect-square bg-muted cursor-pointer" onClick={onClick}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Package className="w-10 h-10 text-muted-foreground" /></div>
        )}
        <button onClick={(e) => { e.stopPropagation(); onLike() }} className={cn("absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center border-2 border-foreground bg-background active:scale-90 transition-transform", isLiked && "bg-red-500 text-white")}>
          <Heart className={cn("w-3.5 h-3.5", isLiked && "fill-current")} />
        </button>
        {product.is_featured && (
          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-yellow-500 text-black text-[8px] font-bold border border-foreground flex items-center gap-0.5">
            <Star className="w-2 h-2 fill-current" /> TOP
          </span>
        )}
      </div>
      <div className="p-2 cursor-pointer" onClick={onClick}>
        <p className="text-[10px] text-muted-foreground truncate">{product.company?.name}</p>
        <p className="font-bold text-xs truncate leading-tight">{product.name}</p>
        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{product.category}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Eye className="w-2.5 h-2.5" />{product.views}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Heart className="w-2.5 h-2.5" />{product.likes}
          </span>
        </div>
      </div>
    </div>
  )
}
