'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  TrendingUp, 
  Star, 
  Clock, 
  ChevronRight,
  Building2,
  Package,
  Users,
  Eye,
  Heart,
  Bookmark,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppHeader } from '@/components/app-header'
import { BottomNav } from '@/components/bottom-nav'
import { AIChatFab } from '@/components/ai-chat-fab'
import { useAppStore } from '@/lib/store'
import { auth } from '@/lib/db'
import type { Product, Company } from '@/lib/types'

// Mock data for demo
const MOCK_PRODUCTS: (Product & { company_name: string })[] = [
  {
    id: '1',
    company_id: 'c1',
    company_name: 'TechCorp Industries',
    name: 'Industrial Robot Arm X500',
    description: 'High-precision robotic arm for manufacturing',
    images: ['/placeholder.svg?height=200&width=200'],
    category: 'Robotics',
    tags: ['automation', 'manufacturing', 'precision'],
    specifications: { 'Payload': '50kg', 'Reach': '1500mm' },
    is_featured: true,
    is_trending: true,
    is_new_arrival: false,
    views: 1234,
    likes: 89,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    company_id: 'c2',
    company_name: 'Global Materials Co',
    name: 'Premium Steel Sheets',
    description: 'High-grade stainless steel for construction',
    images: ['/placeholder.svg?height=200&width=200'],
    category: 'Materials',
    tags: ['steel', 'construction', 'industrial'],
    specifications: { 'Thickness': '2mm-10mm', 'Grade': '304/316' },
    is_featured: true,
    is_trending: false,
    is_new_arrival: true,
    views: 856,
    likes: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    company_id: 'c3',
    company_name: 'PackagePro Solutions',
    name: 'Eco-Friendly Packaging Kit',
    description: 'Sustainable packaging solutions for businesses',
    images: ['/placeholder.svg?height=200&width=200'],
    category: 'Packaging',
    tags: ['eco-friendly', 'sustainable', 'packaging'],
    specifications: { 'Material': 'Recycled cardboard', 'MOQ': '1000 units' },
    is_featured: false,
    is_trending: true,
    is_new_arrival: true,
    views: 567,
    likes: 78,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    company_id: 'c4',
    company_name: 'ChemWorks Ltd',
    name: 'Industrial Adhesive XR-200',
    description: 'High-strength adhesive for heavy-duty applications',
    images: ['/placeholder.svg?height=200&width=200'],
    category: 'Chemicals',
    tags: ['adhesive', 'industrial', 'heavy-duty'],
    specifications: { 'Bond Strength': '3500 PSI', 'Cure Time': '24h' },
    is_featured: false,
    is_trending: false,
    is_new_arrival: false,
    views: 234,
    likes: 23,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const CATEGORIES = [
  { name: 'All', icon: <Package className="w-5 h-5" /> },
  { name: 'Manufacturing', icon: <Building2 className="w-5 h-5" /> },
  { name: 'Robotics', icon: <Users className="w-5 h-5" /> },
  { name: 'Materials', icon: <Package className="w-5 h-5" /> },
  { name: 'Chemicals', icon: <Package className="w-5 h-5" /> },
]

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, user, company, setUser } = useAppStore()
  
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await auth.getSession()
      if (!user) {
        router.push('/auth')
        return
      }
      setUser(user)
      setIsLoading(false)
    }
    checkAuth()
  }, [router, setUser])

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  const trendingProducts = products.filter(p => p.is_trending)
  const featuredProducts = products.filter(p => p.is_featured)
  const newArrivals = products.filter(p => p.is_new_arrival)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-muted" />
            <div className="absolute inset-0 border-4 border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
            Loading
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />

      <main className="p-4 space-y-6">
        {/* Welcome Banner */}
        <div className="brutalist-card p-4 golden-gradient">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 border-4 border-foreground bg-background flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground/70">Welcome back,</p>
              <h2 className="text-xl font-black text-foreground">
                {company?.name || user?.email?.split('@')[0] || 'User'}
              </h2>
            </div>
            <Link 
              href="/profile"
              className="px-4 py-2 border-4 border-foreground bg-background font-bold text-sm hover:bg-accent transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="brutalist-card p-3 text-center">
            <Package className="w-6 h-6 mx-auto mb-1" />
            <p className="text-2xl font-black">{products.length}</p>
            <p className="text-xs text-muted-foreground font-bold">Products</p>
          </div>
          <div className="brutalist-card p-3 text-center">
            <Eye className="w-6 h-6 mx-auto mb-1" />
            <p className="text-2xl font-black">2.4K</p>
            <p className="text-xs text-muted-foreground font-bold">Views</p>
          </div>
          <div className="brutalist-card p-3 text-center">
            <Heart className="w-6 h-6 mx-auto mb-1" />
            <p className="text-2xl font-black">156</p>
            <p className="text-xs text-muted-foreground font-bold">Likes</p>
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">Categories</h3>
            <button className="p-2 border-4 border-foreground hover:bg-accent transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 border-4 whitespace-nowrap font-bold transition-all',
                  selectedCategory === cat.name
                    ? 'border-primary bg-primary text-primary-foreground shadow-[3px_3px_0px_0px] shadow-foreground'
                    : 'border-foreground bg-background hover:bg-accent'
                )}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Trending Section */}
        {trendingProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Trending Now</h3>
              </div>
              <Link href="/products?filter=trending" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                See All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Section */}
        {featuredProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Featured Products</h3>
              </div>
              <Link href="/products?filter=featured" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                See All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">New Arrivals</h3>
              </div>
              <Link href="/products?filter=new" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                See All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* All Products Grid */}
        <section>
          <h3 className="font-bold text-lg mb-3">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </section>
      </main>

      <AIChatFab />
      <BottomNav variant="company" />
    </div>
  )
}

interface ProductCardProps {
  product: Product & { company_name: string }
  compact?: boolean
}

function ProductCard({ product, compact = false }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  return (
    <Link
      href={`/seeproduct/${product.id}`}
      className={cn(
        'brutalist-card overflow-hidden flex-shrink-0',
        compact ? 'w-full' : 'w-48'
      )}
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_trending && (
            <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-xs font-bold border-2 border-foreground">
              TRENDING
            </span>
          )}
          {product.is_new_arrival && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold border-2 border-foreground">
              NEW
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsLiked(!isLiked)
            }}
            className={cn(
              'p-1.5 border-2 border-foreground transition-colors',
              isLiked ? 'bg-destructive text-white' : 'bg-background'
            )}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsSaved(!isSaved)
            }}
            className={cn(
              'p-1.5 border-2 border-foreground transition-colors',
              isSaved ? 'bg-primary text-primary-foreground' : 'bg-background'
            )}
            aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Bookmark className={cn('w-4 h-4', isSaved && 'fill-current')} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-xs text-muted-foreground font-medium truncate">{product.company_name}</p>
        <h4 className="font-bold text-sm line-clamp-2 mt-0.5">{product.name}</h4>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" /> {product.views}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" /> {product.likes}
          </span>
        </div>
      </div>
    </Link>
  )
}
