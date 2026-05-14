"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Check, Package, TrendingUp, Star, Crown, Building, Infinity } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { ALL_PLANS, type PlanId } from "@/lib/plan-gating"
import { cn } from "@/lib/utils"

const ICONS: Record<PlanId, React.ElementType> = {
  starter: Package,
  growth: TrendingUp,
  pro: Star,
  premium: Crown,
  enterprise: Building,
  unlimited: Infinity,
}

const PLAN_COLORS: Record<PlanId, { border: string; badge: string; btn: string }> = {
  starter: { border: "border-foreground", badge: "bg-foreground text-background", btn: "" },
  growth: { border: "border-blue-500", badge: "bg-blue-500 text-white", btn: "bg-blue-500 border-blue-600 text-white" },
  pro: { border: "border-violet-500", badge: "bg-violet-500 text-white", btn: "bg-violet-500 border-violet-600 text-white" },
  premium: { border: "border-primary", badge: "bg-primary text-primary-foreground", btn: "bg-primary border-foreground text-primary-foreground" },
  enterprise: { border: "border-orange-500", badge: "bg-orange-500 text-white", btn: "bg-orange-500 border-orange-600 text-white" },
  unlimited: { border: "border-red-500", badge: "bg-red-500 text-white", btn: "bg-red-500 border-red-600 text-white" },
}

const FEATURE_LABELS: Record<string, (val: unknown) => string | null> = {
  productLimit: v => v === -1 ? "Unlimited products" : `Up to ${v} products`,
  reelLimit: v => v === -1 ? "Unlimited reels" : `Up to ${v} reels`,
  teamSeats: v => v === -1 ? "Unlimited team seats" : `${v} team seat${Number(v) > 1 ? "s" : ""}`,
  analyticsLevel: v => v === "none" ? null : `${String(v).charAt(0).toUpperCase() + String(v).slice(1)} analytics`,
  audioCall: v => v ? "Audio calls (LiveKit)" : null,
  videoCall: v => v ? "Video calls + background blur" : null,
  fileAttachments: v => v ? "File attachments in chat (20 MB)" : null,
  voiceMessages: v => v ? "Voice messages" : null,
  csvExport: v => v ? "CSV export" : null,
  bulkExport: v => v ? "Bulk export" : null,
  multiProductReel: v => v ? "Tag up to 5 products per reel" : null,
  goldenTheme: v => v ? "Golden Premium animated theme" : null,
  aiReplySuggestions: v => v ? "AI quick-reply suggestions" : null,
  customDomain: v => v ? "Custom domain support" : null,
  removeBranding: v => v ? "White-label (remove branding)" : null,
  apiAccess: v => v ? "Full API access" : null,
  prioritySupport: v => v ? "Priority support" : null,
  dedicatedManager: v => v ? "Dedicated account manager" : null,
  verifiedBadge: v => v ? "Verified badge" : null,
}

const FEATURE_ORDER = [
  "productLimit","reelLimit","analyticsLevel","teamSeats",
  "audioCall","videoCall","fileAttachments","voiceMessages",
  "multiProductReel","csvExport","bulkExport",
  "goldenTheme","aiReplySuggestions","customDomain",
  "removeBranding","apiAccess","verifiedBadge",
  "prioritySupport","dedicatedManager",
]

function formatINR(n: number) {
  return n.toLocaleString("en-IN")
}

export default function PackagesPage() {
  const router = useRouter()
  const { user, company } = useAppStore()
  const currentPlan = (company?.subscription_plan ?? "starter") as PlanId

  const [selected, setSelected] = useState<PlanId | null>(null)
  const [upgrading, setUpgrading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleUpgrade(planId: PlanId) {
    if (!user) { router.push("/auth"); return }
    setSelected(planId); setUpgrading(true)
    // TODO: wire real payment gateway (Razorpay/Stripe)
    await new Promise(r => setTimeout(r, 1200))
    setUpgrading(false); setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background border-b-2 border-foreground/20 flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="p-1.5 border-2 border-foreground/30 hover:border-foreground transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-black uppercase tracking-tight">Packages</h1>
          <p className="text-[11px] text-muted-foreground">Current: <strong className="text-foreground capitalize">{currentPlan}</strong></p>
        </div>
      </header>

      <main className="px-4 pt-4 flex flex-col gap-4">
        {success && (
          <div className="p-3 border-2 border-green-600 bg-green-50 text-green-700 text-sm font-bold text-center">
            Plan upgrade request sent! Our team will contact you shortly.
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          All prices in Indian Rupees (INR), billed monthly. Higher tiers include all features from lower tiers.
        </p>

        {ALL_PLANS.map(plan => {
          const Icon = ICONS[plan.id] ?? Package
          const colors = PLAN_COLORS[plan.id]
          const isCurrent = plan.id === currentPlan
          const isHigher = ALL_PLANS.findIndex(p => p.id === plan.id) > ALL_PLANS.findIndex(p => p.id === currentPlan)

          // Build feature list
          const features: string[] = []
          for (const key of FEATURE_ORDER) {
            const val = (plan as unknown as Record<string, unknown>)[key]
            const label = FEATURE_LABELS[key]?.(val)
            if (label) features.push(label)
          }

          return (
            <div key={plan.id} className={cn(
              "bg-card border-2 shadow-[3px_3px_0px_0px] transition-shadow",
              isCurrent ? `${colors.border} shadow-primary` : `border-foreground/20 shadow-foreground/20`,
              plan.id === "premium" && "border-primary shadow-[3px_3px_0px_0px] shadow-primary"
            )}>
              {/* Plan header */}
              <div className={cn("flex items-start justify-between p-4 border-b-2",
                isCurrent ? "border-primary/20" : "border-foreground/10")}>
                <div className="flex items-center gap-2.5">
                  <div className={cn("w-9 h-9 flex items-center justify-center border-2", colors.border)}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-black uppercase tracking-wide">{plan.id.toUpperCase()}</h2>
                      {isCurrent && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-primary text-primary-foreground">
                          Current
                        </span>
                      )}
                      {plan.id === "premium" && !isCurrent && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-primary text-primary-foreground">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.priceMonthlyLabel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black">₹{formatINR(plan.priceINR)}</p>
                  <p className="text-[10px] text-muted-foreground">/month</p>
                </div>
              </div>

              {/* Features */}
              <div className="p-4 flex flex-col gap-1.5">
                {features.map(f => (
                  <div key={f} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-600" />
                    <span className="text-xs text-foreground/80">{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {!isCurrent && (
                <div className="px-4 pb-4">
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading && selected === plan.id}
                    className={cn(
                      "w-full py-2.5 text-xs font-black uppercase tracking-widest border-2 transition-all",
                      "shadow-[2px_2px_0px_0px] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_0px]",
                      "active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
                      "disabled:opacity-60 disabled:cursor-not-allowed",
                      colors.btn
                        ? `${colors.btn} shadow-foreground`
                        : "bg-foreground text-background border-foreground shadow-foreground/40",
                      isHigher ? "opacity-100" : "opacity-70"
                    )}>
                    {upgrading && selected === plan.id ? "Processing..." : isHigher ? `Upgrade to ${plan.id.toUpperCase()}` : "Switch Plan"}
                  </button>
                </div>
              )}
            </div>
          )
        })}

        <p className="text-[11px] text-muted-foreground text-center pb-2">
          Contact us at <strong>support@goldensbizlink.com</strong> for custom enterprise quotes.
        </p>
      </main>
    </div>
  )
}
