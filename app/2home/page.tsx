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
  Eye,
  Heart,
  Bookmark,
  Search,
  MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppHeader } from '@/components/app-header'
import { BottomNav } from '@/components/bottom-nav'
import { AIChatFab } from '@/components/ai-chat-fab'
import { useAppStore } from '@/lib/store'
import { auth } from '@/lib/db'
import type { Product, Company } from '@/lib/types'

// Mock data for demo
const MOCK_PRODUCTS: (Product & { company_name: string; company_location: string })[] = [
  {
    id: '1',
    company_id: 'c1',
    company_name: 'TechCorp Industries',
    company_location: 'California, USA',
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
    company_location: 'Dubai, UAE',
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
    company_location: 'Mumbai, India',
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
]

const MOCK_COMPANIES: Partial<Company & { product_count: number }>[] = [
  {
    id: 'c1',
    name: 'TechCorp Industries',
    logo: '/placeholder.svg?height=60&width=60',
    industry_category: 'Technology',
    country: 'United States',
    product_count: 24,
  },
  {
    id: 'c2',
    name: 'Global Materials Co',
    logo: '/placeholder.svg?height=60&width=60',
    industry_category: 'Materials',
    country: 'United Arab Emirates',
    product_count: 18,
  },
  {
    id: 'c3',
    name: 'PackagePro Solutions',
    logo: '/placeholder.svg?height=60&width=60',
    industry_category: 'Packaging',
    country: 'India',
    product_count: 12,
  },
]

export default function SalesmanHomePage() {
  const router = useRouter()
  const { isAuthenticated, user, setUser, selectedRole } = useAppStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState(MOCK_PRODUCTS)
  const [companies, setCompanies] = useState(MOCK_COMPANIES)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await auth.getSession()
      if (!user) {
        router.push('/2auth')
        return
      }
      setUser(user)
      setIsLoading(false)
    }
    checkAuth()
  }, [router, setUser])

  const trendingProducts = products.filter(p => p.is_trending)
  const featuredProducts = products.filter(p => p.is_featured)

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
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, companies..."
            className="brutalist-input w-full pl-12"
          />
        </div>

        {/* Welcome Banner */}
        <div className="brutalist-card p-4 bg-accent">
          <h2 className="text-xl font-black text-foreground mb-1">
            Welcome, {selectedRole === 'salesman' ? 'Salesman' : 'Explorer'}!
          </h2>
          <p className="text-sm text-muted-foreground">
            Discover products and connect with businesses worldwide
          </p>
        </div>

        {/* Top Companies */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Top Companies</h3>
            </div>
            <Link href="/network" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/seeprofile/${company.id}`}
                className="brutalist-card p-4 flex-shrink-0 w-40 text-center"
              >
                <div className="w-16 h-16 mx-auto border-4 border-foreground bg-muted mb-2 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-bold text-sm line-clamp-1">{company.name}</h4>
                <p className="text-xs text-muted-foreground">{company.industry_category}</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {company.country}
                </div>
                <p className="text-xs font-bold text-primary mt-2">{company.product_count} Products</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Products */}
        {trendingProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Trending Products</h3>
              </div>
              <Link href="/feed?filter=trending" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
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

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Featured Products</h3>
              </div>
              <Link href="/feed?filter=featured" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
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

        {/* All Products Grid */}
        <section>
          <h3 className="font-bold text-lg mb-3">Explore Products</h3>
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </section>
      </main>

      <AIChatFab />
      <BottomNav variant="salesman" />
    </div>
  )
}

interface ProductCardProps {
  product: Product & { company_name: string; company_location?: string }
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
