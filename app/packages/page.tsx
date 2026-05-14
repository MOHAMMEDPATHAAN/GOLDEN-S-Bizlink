"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Star, Zap, Crown, Sparkles, Shield, TrendingUp, Users, MessageCircle, Package, Eye, X } from "lucide-react"
import { useAppStore } from "@/lib/store"

interface PricingPlan {
  id: string
  name: string
  icon: React.ElementType
  price: number
  period: "month" | "year"
  description: string
  features: string[]
  highlighted?: boolean
  badge?: string
}

const PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    icon: Package,
    price: 0,
    period: "month",
    description: "Get started for free",
    features: [
      "Up to 5 product listings",
      "Basic company profile",
      "View feed and reels",
      "3 messages per day",
      "Basic search visibility",
      "Community support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    icon: TrendingUp,
    price: 19,
    period: "month",
    description: "For emerging businesses",
    features: [
      "Up to 25 product listings",
      "Enhanced company profile",
      "25 messages per day",
      "Upload up to 5 reels",
      "Improved search ranking",
      "Email support",
      "Basic analytics",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    icon: Star,
    price: 49,
    period: "month",
    description: "For growing businesses",
    features: [
      "Up to 100 product listings",
      "Featured company profile",
      "Unlimited messages",
      "Upload up to 20 reels",
      "Priority search placement",
      "Advanced analytics",
      "Priority email support",
      "Verified badge",
    ],
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "business",
    name: "Business",
    icon: Zap,
    price: 99,
    period: "month",
    description: "For established companies",
    features: [
      "Up to 500 product listings",
      "Premium company profile",
      "Unlimited messages + calls",
      "Unlimited reels",
      "Top search placement",
      "Full analytics suite",
      "Phone & email support",
      "Verified + Featured badge",
      "Custom branding",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Crown,
    price: 249,
    period: "month",
    description: "For large organizations",
    features: [
      "Unlimited product listings",
      "White-label profile",
      "Dedicated account manager",
      "Custom integrations",
      "API access",
      "Team management (10 seats)",
      "24/7 priority support",
      "Custom analytics reports",
      "SLA guarantee",
      "Remove Bizlink branding",
    ],
  },
  {
    id: "unlimited",
    name: "Unlimited",
    icon: Sparkles,
    price: 499,
    period: "month",
    description: "No limits, maximum power",
    features: [
      "Everything in Enterprise",
      "Unlimited team seats",
      "Multi-company management",
      "Custom feature development",
      "Dedicated server resources",
      "On-site training",
      "Custom contract terms",
      "Direct CEO hotline",
      "Lifetime priority status",
      "Early access to new features",
    ],
    badge: "Best Value",
  },
]

export default function PackagesPage() {
  const router = useRouter()
  const { user, company } = useAppStore()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const getPrice = (plan: PricingPlan) => {
    if (billingCycle === "yearly") {
      return Math.floor(plan.price * 10) // 2 months free
    }
    return plan.price
  }

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    setShowConfirmModal(true)
  }

  const handleConfirm = () => {
    // Handle subscription logic
    alert(`You selected the ${PLANS.find(p => p.id === selectedPlan)?.name} plan. In production, this would redirect to a payment gateway.`)
    setShowConfirmModal(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b-4 border-foreground sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted transition-colors border-2 border-transparent hover:border-foreground"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Subscription Plans</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Hero Section */}
      <div className="golden-gradient p-6 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary-foreground" />
        <h2 className="text-2xl font-bold text-primary-foreground mb-2">
          Grow Your Business with Bizlink
        </h2>
        <p className="text-primary-foreground/80 max-w-md mx-auto">
          Choose the plan that fits your needs and start reaching more wholesale buyers today.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center py-6">
        <div className="flex items-center gap-4 p-1 border-4 border-foreground bg-card">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 font-bold transition-colors ${
              billingCycle === "monthly" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-2 font-bold transition-colors relative ${
              billingCycle === "yearly" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            Yearly
            <span className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-1.5 py-0.5 font-bold">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`brutalist-card p-6 flex flex-col relative ${
              plan.highlighted ? "border-primary border-4 bg-primary/5" : ""
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold">
                {plan.badge}
              </span>
            )}

            <div className="text-center mb-6">
              <div className={`w-14 h-14 mx-auto mb-4 flex items-center justify-center border-4 border-foreground ${
                plan.highlighted ? "bg-primary" : "bg-muted"
              }`}>
                <plan.icon className={`w-7 h-7 ${plan.highlighted ? "text-primary-foreground" : ""}`} />
              </div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
            </div>

            <div className="text-center mb-6">
              <span className="text-4xl font-black">${getPrice(plan)}</span>
              <span className="text-muted-foreground">
                /{billingCycle === "yearly" ? "year" : "month"}
              </span>
              {billingCycle === "yearly" && plan.price > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  Save ${plan.price * 2}/year
                </p>
              )}
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan.id)}
              className={`w-full py-3 font-bold border-4 border-foreground transition-colors ${
                plan.highlighted
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-card hover:bg-muted"
              }`}
            >
              {plan.price === 0 ? "Get Started" : "Subscribe"}
            </button>
          </div>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="p-4 mt-8 max-w-4xl mx-auto">
        <h3 className="text-xl font-bold text-center mb-6">Why Choose Bizlink Premium?</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="brutalist-card p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="font-bold">10x More Visibility</p>
            <p className="text-xs text-muted-foreground">Reach more buyers</p>
          </div>
          <div className="brutalist-card p-4 text-center">
            <Shield className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="font-bold">Verified Badge</p>
            <p className="text-xs text-muted-foreground">Build trust</p>
          </div>
          <div className="brutalist-card p-4 text-center">
            <Eye className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="font-bold">Analytics</p>
            <p className="text-xs text-muted-foreground">Track performance</p>
          </div>
          <div className="brutalist-card p-4 text-center">
            <MessageCircle className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="font-bold">Priority Support</p>
            <p className="text-xs text-muted-foreground">We're here to help</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="p-4 mt-8 max-w-2xl mx-auto pb-20">
        <h3 className="text-xl font-bold text-center mb-6">Frequently Asked Questions</h3>
        
        <div className="space-y-4">
          <div className="brutalist-card p-4">
            <h4 className="font-bold mb-2">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! You can cancel your subscription at any time. Your plan will remain active until the end of the billing period.
            </p>
          </div>
          <div className="brutalist-card p-4">
            <h4 className="font-bold mb-2">What payment methods do you accept?</h4>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
            </p>
          </div>
          <div className="brutalist-card p-4">
            <h4 className="font-bold mb-2">Can I upgrade or downgrade my plan?</h4>
            <p className="text-sm text-muted-foreground">
              Absolutely! You can change your plan at any time. Changes take effect immediately, and we'll prorate the billing.
            </p>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirmModal(false)} />
          <div className="relative w-full max-w-md bg-card border-4 border-foreground p-6">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold mb-4">Confirm Subscription</h3>
            
            <div className="p-4 bg-muted border-2 border-foreground mb-4">
              <p className="font-bold">{PLANS.find(p => p.id === selectedPlan)?.name} Plan</p>
              <p className="text-2xl font-black">
                ${getPrice(PLANS.find(p => p.id === selectedPlan)!)}
                <span className="text-sm font-normal text-muted-foreground">
                  /{billingCycle === "yearly" ? "year" : "month"}
                </span>
              </p>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              By continuing, you agree to our Terms of Service and will be charged automatically.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 border-4 border-foreground font-bold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 bg-primary border-4 border-foreground font-bold text-primary-foreground"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
