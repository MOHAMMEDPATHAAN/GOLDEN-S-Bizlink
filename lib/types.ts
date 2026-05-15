// ============================================
// BIZLINK — Type Definitions
// Developer: GOLDEN'S (Golden techS)
// ============================================

export type UserRole = 'company_owner' | 'company_manager' | 'salesman' | 'viewer'

// Unified theme — 'golden' maps to golden-premium class in CSS
export type Theme = 'system' | 'light' | 'dark' | 'golden'

// Must match PlanId in lib/plan-gating.ts exactly
export type SubscriptionPlan =
  | 'starter'    // ₹999/mo
  | 'growth'     // ₹4,999/mo
  | 'pro'        // ₹9,999/mo
  | 'premium'    // ₹14,999/mo
  | 'enterprise' // ₹49,999/mo
  | 'unlimited'  // ₹99,999/mo

export type Currency = 'USD' | 'AED' | 'INR' | 'CAD' | 'GBP' | 'EUR' | 'JPY'

// ─── User (mirrors Supabase auth.users + user_profiles table) ─────────────
export interface User {
  id: string
  email: string
  name?: string               // display name
  avatar_url?: string         // from Google or uploaded
  phone?: string
  role: UserRole
  created_at: string
  updated_at: string
  last_login?: string
  is_verified: boolean
  two_factor_enabled: boolean
  profile_completeness: number // 0-100
  subscription_plan?: SubscriptionPlan
}

// ─── Company ──────────────────────────────────────────────────────────────
export interface Company {
  id: string
  owner_id: string
  name: string
  ceo_name?: string
  ceo_image_url?: string
  profile?: string            // short bio
  logo_url?: string           // default: /default-avatar.jpg
  // address (flat columns — easier for Supabase filters)
  street?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  lat?: number
  lng?: number
  // business
  industry?: string
  production_types?: string[]
  employee_count?: number
  website?: string
  year_established?: number
  annual_revenue_range?: string
  primary_language?: string
  preferred_currency?: Currency
  legal_entity_type?: string
  tax_id?: string
  tax_id_verified?: boolean
  tax_exempt?: boolean
  // social
  linkedin?: string
  twitter?: string
  instagram?: string
  youtube?: string
  snapchat?: string
  whatsapp?: string
  phone?: string
  email?: string
  // subscription / meta
  subscription_plan: SubscriptionPlan
  is_verified?: boolean
  accept_marketing?: boolean
  created_at: string
  updated_at: string
}

// ─── Product ──────────────────────────────────────────────────────────────
export interface Product {
  id: string
  company_id: string
  // joined relation (Supabase select with *)
  company?: { name: string; logo_url?: string }
  name: string
  description?: string
  images: string[]            // B2 paths — resolved to URLs in db.ts
  video_url?: string
  category?: string
  subcategory?: string
  tags?: string[]
  specifications?: Record<string, string>
  price_range?: string
  moq?: number
  lead_time?: string
  is_featured?: boolean
  is_trending?: boolean
  is_new_arrival?: boolean
  is_active?: boolean
  views?: number
  likes?: number
  created_at: string
  updated_at: string
}

// ─── Reel ─────────────────────────────────────────────────────────────────
export interface Reel {
  id: string
  company_id: string
  company?: { name: string; logo_url?: string }
  product_id?: string
  video_url: string           // B2 path — resolved in db.ts
  thumbnail_url?: string
  title?: string
  description?: string
  caption?: string
  tags?: string[]
  views?: number
  likes?: number
  comments_count?: number
  shares?: number
  duration?: number
  is_active?: boolean
  created_at: string
}

// ─── Chat / Message ───────────────────────────────────────────────────────
export interface Chat {
  id: string
  participants: string[]
  last_message?: Message
  unread_count: number
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  type: 'text' | 'image' | 'file' | 'voice'
  read: boolean
  created_at: string
}

// ─── Notification ─────────────────────────────────────────────────────────
export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: 'system' | 'chat' | 'order' | 'promotion'
  read: boolean
  action_url?: string
  created_at: string
}

// ─── Wishlist ─────────────────────────────────────────────────────────────
export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  added_at: string
}

// ─── User Settings ────────────────────────────────────────────────────────
export interface UserSettings {
  user_id: string
  theme: Theme
  language: string
  font_size: 'small' | 'medium' | 'large'
  high_contrast: boolean
  reduced_motion: boolean
  push_enabled: boolean
  email_notifications: boolean
  sound_enabled: boolean
  vibration_enabled: boolean
  show_online_status: boolean
  show_last_seen: boolean
  allow_messages_from: 'everyone' | 'connections' | 'none'
  default_currency: Currency
  measurement_unit: 'metric' | 'imperial'
  date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  time_zone: string
  startup_page: 'home' | 'reels' | 'products' | 'last_visited'
  auto_play_reels: boolean
  infinite_scroll: boolean
  data_saver_mode: boolean
  app_lock_enabled: boolean
  app_lock_pin?: string
  biometric_enabled: boolean
}

// ─── Lookup constants ─────────────────────────────────────────────────────
export const PRODUCTION_TYPES = [
  'Manufacturing', 'Wholesale', 'Retail', 'Import/Export', 'Agriculture',
  'Technology', 'Healthcare', 'Construction', 'Automotive', 'Textiles',
  'Food & Beverage', 'Electronics', 'Chemicals', 'Pharmaceuticals', 'Energy',
  'Mining', 'Logistics', 'Financial Services', 'Real Estate', 'Hospitality',
  'Education', 'Media & Entertainment', 'Other',
] as const

export const INDUSTRY_CATEGORIES = [
  'Manufacturing', 'Retail', 'Technology', 'Healthcare', 'Construction',
  'Agriculture', 'Automotive', 'Financial Services', 'Real Estate',
  'Hospitality', 'Education', 'Media', 'Other',
] as const

export const LEGAL_ENTITY_TYPES = [
  'LLC', 'Corporation', 'Partnership', 'Sole Proprietorship',
  'Non-Profit', 'Cooperative', 'Other',
] as const

export const COUNTRIES = [
  'United States', 'United Arab Emirates', 'India', 'Canada', 'United Kingdom',
  'Germany', 'France', 'Japan', 'China', 'Australia', 'Brazil', 'Mexico',
  'South Korea', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Singapore',
  'Saudi Arabia', 'South Africa', 'Other',
] as const

export const LANGUAGES = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ar', name: 'Arabic (العربية)', dir: 'rtl' },
  { code: 'hi', name: 'Hindi (हिन्दी)', dir: 'ltr' },
  { code: 'es', name: 'Spanish (Español)', dir: 'ltr' },
  { code: 'fr', name: 'French (Français)', dir: 'ltr' },
  { code: 'de', name: 'German (Deutsch)', dir: 'ltr' },
  { code: 'ja', name: 'Japanese (日本語)', dir: 'ltr' },
  { code: 'zh', name: 'Chinese (中文)', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese (Português)', dir: 'ltr' },
  { code: 'ru', name: 'Russian (Русский)', dir: 'ltr' },
  { code: 'ko', name: 'Korean (한국어)', dir: 'ltr' },
  { code: 'it', name: 'Italian (Italiano)', dir: 'ltr' },
  { code: 'nl', name: 'Dutch (Nederlands)', dir: 'ltr' },
  { code: 'tr', name: 'Turkish (Türkçe)', dir: 'ltr' },
  { code: 'pl', name: 'Polish (Polski)', dir: 'ltr' },
  { code: 'th', name: 'Thai (ภาษาไทย)', dir: 'ltr' },
  { code: 'vi', name: 'Vietnamese (Tiếng Việt)', dir: 'ltr' },
  { code: 'id', name: 'Indonesian (Bahasa)', dir: 'ltr' },
  { code: 'ms', name: 'Malay (Melayu)', dir: 'ltr' },
  { code: 'sv', name: 'Swedish (Svenska)', dir: 'ltr' },
  { code: 'da', name: 'Danish (Dansk)', dir: 'ltr' },
  { code: 'fi', name: 'Finnish (Suomi)', dir: 'ltr' },
  { code: 'no', name: 'Norwegian (Norsk)', dir: 'ltr' },
  { code: 'cs', name: 'Czech (Čeština)', dir: 'ltr' },
  { code: 'el', name: 'Greek (Ελληνικά)', dir: 'ltr' },
  { code: 'ur', name: 'Urdu (اردو)', dir: 'rtl' },
] as const

export const CURRENCIES: { code: Currency; symbol: string; name: string }[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
]

export const REVENUE_RANGES = [
  'Under $100K', '$100K–$500K', '$500K–$1M', '$1M–$5M',
  '$5M–$10M', '$10M–$50M', '$50M–$100M', 'Over $100M', 'Prefer not to say',
] as const

export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
] as const

// See lib/plan-gating.ts for full per-plan feature matrix.

// Helper: random Bizlink_user ID
export function generateGuestName(): string {
  return `Bizlink_user_${Math.floor(100000 + Math.random() * 900000)}`
}
