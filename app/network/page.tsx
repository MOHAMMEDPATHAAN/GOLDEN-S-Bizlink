"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Filter, Building2, MapPin, Users, Package, Star, UserPlus, UserCheck, MessageCircle, ChevronRight, X, SlidersHorizontal } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { BottomNav } from "@/components/bottom-nav"
import { AIChatFab } from "@/components/ai-chat-fab"

interface Company {
  id: string
  name: string
  logo?: string
  location: string
  industry: string
  productCount: number
  followerCount: number
  rating: number
  isFollowing: boolean
  isVerified: boolean
}

const INDUSTRIES = [
  "All",
  "Electronics",
  "Textiles",
  "Machinery",
  "Food & Beverage",
  "Chemicals",
  "Construction",
  "Automotive",
  "Healthcare",
]

const COUNTRIES = [
  "All Countries",
  "USA",
  "UAE",
  "India",
  "UK",
  "Germany",
  "Japan",
  "Canada",
  "Australia",
]

export default function NetworkPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("All")
  const [selectedCountry, setSelectedCountry] = useState("All Countries")
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<"discover" | "following" | "followers">("discover")

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    setIsLoading(true)
    try {
      // Mock companies data
      const mockCompanies: Company[] = Array.from({ length: 15 }, (_, i) => ({
        id: `company-${i + 1}`,
        name: `${["Global", "Premier", "Elite", "Prime", "Advanced"][i % 5]} ${["Tech", "Industries", "Solutions", "Corp", "Enterprises"][i % 5]} ${i + 1}`,
        location: ["New York, USA", "Dubai, UAE", "Mumbai, India", "London, UK", "Tokyo, Japan"][i % 5],
        industry: INDUSTRIES[(i % (INDUSTRIES.length - 1)) + 1],
        productCount: Math.floor(Math.random() * 100 + 10),
        followerCount: Math.floor(Math.random() * 5000 + 100),
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        isFollowing: i % 3 === 0,
        isVerified: i % 4 === 0,
      }))
      setCompanies(mockCompanies)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollow = (companyId: string) => {
    setCompanies(companies.map(c => 
      c.id === companyId 
        ? { ...c, isFollowing: !c.isFollowing, followerCount: c.isFollowing ? c.followerCount - 1 : c.followerCount + 1 }
        : c
    ))
  }

  const filteredCompanies = companies
    .filter((company) => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesIndustry = selectedIndustry === "All" || company.industry === selectedIndustry
      const matchesCountry = selectedCountry === "All Countries" || company.location.includes(selectedCountry)
      
      if (activeTab === "following") {
        return matchesSearch && matchesIndustry && matchesCountry && company.isFollowing
      }
      return matchesSearch && matchesIndustry && matchesCountry
    })

  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const CompanyCard = ({ company }: { company: Company }) => (
    <div className="brutalist-card p-4">
      <div className="flex items-start gap-3">
        <button
          onClick={() => router.push(`/company/${company.id}`)}
          className="w-16 h-16 rounded-full border-4 border-foreground bg-primary flex items-center justify-center overflow-hidden flex-shrink-0"
        >
          {company.logo ? (
            <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-8 h-8 text-primary-foreground" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <button
            onClick={() => router.push(`/company/${company.id}`)}
            className="flex items-center gap-2"
          >
            <h3 className="font-bold truncate">{company.name}</h3>
            {company.isVerified && (
              <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">✓</span>
              </span>
            )}
          </button>
          
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {company.location}
          </p>
          
          <p className="text-xs text-primary mt-1">{company.industry}</p>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {company.productCount} products
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {formatNumber(company.followerCount)} followers
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              {company.rating}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => handleFollow(company.id)}
          className={`flex-1 py-2 font-bold text-sm border-2 flex items-center justify-center gap-2 transition-colors ${
            company.isFollowing
              ? "border-foreground bg-muted hover:bg-muted/80"
              : "border-primary bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          {company.isFollowing ? (
            <>
              <UserCheck className="w-4 h-4" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Follow
            </>
          )}
        </button>
        <button
          onClick={() => router.push(`/chat?company=${company.id}`)}
          className="py-2 px-4 border-2 border-foreground hover:bg-muted transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
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
          <h1 className="text-xl font-bold">Network</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 transition-colors border-2 ${
              showFilters ? "border-primary bg-primary/10" : "border-transparent hover:border-foreground hover:bg-muted"
            }`}
          >
            <SlidersHorizontal className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search companies..."
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

        {/* Tabs */}
        <div className="flex border-t-2 border-foreground">
          {(["discover", "following", "followers"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 border-t-2 border-foreground space-y-4">
            <div>
              <p className="text-sm font-bold mb-2">Industry</p>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((industry) => (
                  <button
                    key={industry}
                    onClick={() => setSelectedIndustry(industry)}
                    className={`px-3 py-1 text-sm border-2 transition-colors ${
                      selectedIndustry === industry
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-foreground hover:bg-muted"
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold mb-2">Country</p>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="brutalist-input w-full"
              >
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="brutalist-card p-4">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-full skeleton-gold" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton-gold w-3/4" />
                  <div className="h-3 skeleton-gold w-1/2" />
                  <div className="h-3 skeleton-gold w-2/3" />
                </div>
              </div>
            </div>
          ))
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-bold text-lg">No Companies Found</h3>
            <p className="text-muted-foreground">
              {activeTab === "following" 
                ? "You're not following any companies yet" 
                : "Try adjusting your search or filters"}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {filteredCompanies.length} compan{filteredCompanies.length !== 1 ? "ies" : "y"}
            </p>
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
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
