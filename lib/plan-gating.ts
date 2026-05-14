// ============================================
// BIZLINK — Subscription Plan Gating
// Developer: GOLDEN'S (Golden techS)
// All limits/feature flags derive from the
// company's active subscription_plan field
// that is stored in Supabase.
// ============================================

export type PlanId =
  | 'starter'
  | 'growth'
  | 'pro'
  | 'premium'
  | 'enterprise'
  | 'unlimited'

// ─── per-plan feature matrix ────────────────
const PLAN_CONFIG: Record<
  PlanId,
  {
    priceINR: number
    priceMonthlyLabel: string
    productLimit: number   // -1 = unlimited
    reelLimit: number
    messageLimit: number   // per day, -1 = unlimited
    audioCall: boolean
    videoCall: boolean
    goldenTheme: boolean
    aiChat: boolean
    aiReplySuggestions: boolean
    csvExport: boolean
    bulkExport: boolean
    multiProductReel: boolean  // tag >1 product per reel
    fileAttachments: boolean
    voiceMessages: boolean
    customDomain: boolean
    analyticsLevel: 'none' | 'basic' | 'advanced' | 'full'
    searchBadge: 'none' | 'new_arrival' | 'trending' | 'featured'
    verifiedBadge: boolean
    removeBranding: boolean
    apiAccess: boolean
    teamSeats: number        // -1 = unlimited
    prioritySupport: boolean
    dedicatedManager: boolean
  }
> = {
  starter: {
    priceINR: 999,
    priceMonthlyLabel: '₹999/mo',
    productLimit: 50,
    reelLimit: 10,
    messageLimit: -1,          // basic text chat unlimited
    audioCall: false,
    videoCall: false,
    goldenTheme: false,
    aiChat: false,
    aiReplySuggestions: false,
    csvExport: false,
    bulkExport: false,
    multiProductReel: false,
    fileAttachments: false,
    voiceMessages: false,
    customDomain: false,
    analyticsLevel: 'none',
    searchBadge: 'none',
    verifiedBadge: false,
    removeBranding: false,
    apiAccess: false,
    teamSeats: 1,
    prioritySupport: false,
    dedicatedManager: false,
  },
  growth: {
    priceINR: 4999,
    priceMonthlyLabel: '₹4,999/mo',
    productLimit: 250,
    reelLimit: 50,
    messageLimit: -1,
    audioCall: true,
    videoCall: false,
    goldenTheme: false,
    aiChat: false,
    aiReplySuggestions: false,
    csvExport: false,
    bulkExport: false,
    multiProductReel: false,
    fileAttachments: true,
    voiceMessages: true,
    customDomain: false,
    analyticsLevel: 'basic',
    searchBadge: 'new_arrival',
    verifiedBadge: false,
    removeBranding: false,
    apiAccess: false,
    teamSeats: 3,
    prioritySupport: false,
    dedicatedManager: false,
  },
  pro: {
    priceINR: 9999,
    priceMonthlyLabel: '₹9,999/mo',
    productLimit: 1000,
    reelLimit: 200,
    messageLimit: -1,
    audioCall: true,
    videoCall: true,
    goldenTheme: false,
    aiChat: false,
    aiReplySuggestions: false,
    csvExport: true,
    bulkExport: true,
    multiProductReel: true,
    fileAttachments: true,
    voiceMessages: true,
    customDomain: false,
    analyticsLevel: 'advanced',
    searchBadge: 'trending',
    verifiedBadge: true,
    removeBranding: false,
    apiAccess: false,
    teamSeats: 5,
    prioritySupport: false,
    dedicatedManager: false,
  },
  premium: {
    priceINR: 14999,
    priceMonthlyLabel: '₹14,999/mo',
    productLimit: -1,
    reelLimit: -1,
    messageLimit: -1,
    audioCall: true,
    videoCall: true,
    goldenTheme: true,
    aiChat: true,
    aiReplySuggestions: true,
    csvExport: true,
    bulkExport: true,
    multiProductReel: true,
    fileAttachments: true,
    voiceMessages: true,
    customDomain: true,
    analyticsLevel: 'full',
    searchBadge: 'featured',
    verifiedBadge: true,
    removeBranding: true,
    apiAccess: false,
    teamSeats: 10,
    prioritySupport: true,
    dedicatedManager: false,
  },
  enterprise: {
    priceINR: 49999,
    priceMonthlyLabel: '₹49,999/mo',
    productLimit: -1,
    reelLimit: -1,
    messageLimit: -1,
    audioCall: true,
    videoCall: true,
    goldenTheme: true,
    aiChat: true,
    aiReplySuggestions: true,
    csvExport: true,
    bulkExport: true,
    multiProductReel: true,
    fileAttachments: true,
    voiceMessages: true,
    customDomain: true,
    analyticsLevel: 'full',
    searchBadge: 'featured',
    verifiedBadge: true,
    removeBranding: true,
    apiAccess: true,
    teamSeats: 25,
    prioritySupport: true,
    dedicatedManager: true,
  },
  unlimited: {
    priceINR: 99999,
    priceMonthlyLabel: '₹99,999/mo',
    productLimit: -1,
    reelLimit: -1,
    messageLimit: -1,
    audioCall: true,
    videoCall: true,
    goldenTheme: true,
    aiChat: true,
    aiReplySuggestions: true,
    csvExport: true,
    bulkExport: true,
    multiProductReel: true,
    fileAttachments: true,
    voiceMessages: true,
    customDomain: true,
    analyticsLevel: 'full',
    searchBadge: 'featured',
    verifiedBadge: true,
    removeBranding: true,
    apiAccess: true,
    teamSeats: -1,
    prioritySupport: true,
    dedicatedManager: true,
  },
}

export function getPlanConfig(plan: PlanId | string) {
  return PLAN_CONFIG[(plan as PlanId) ?? 'starter'] ?? PLAN_CONFIG.starter
}

/** Returns true if the given feature is available on the plan. */
export function canUseFeature(
  plan: PlanId | string,
  feature: keyof ReturnType<typeof getPlanConfig>
): boolean {
  const cfg = getPlanConfig(plan)
  const val = cfg[feature as keyof typeof cfg]
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val !== 0
  if (typeof val === 'string') return val !== 'none'
  return false
}

/** Returns true if the company can add one more product. */
export function canAddProduct(plan: PlanId | string, currentCount: number): boolean {
  const limit = getPlanConfig(plan).productLimit
  return limit === -1 || currentCount < limit
}

/** Returns true if the company can add one more reel. */
export function canAddReel(plan: PlanId | string, currentCount: number): boolean {
  const limit = getPlanConfig(plan).reelLimit
  return limit === -1 || currentCount < limit
}

export const ALL_PLANS = Object.entries(PLAN_CONFIG).map(([id, cfg]) => ({
  id: id as PlanId,
  ...cfg,
}))
