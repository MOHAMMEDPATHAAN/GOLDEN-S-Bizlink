// ============================================
// BIZLINK - Type Definitions
// Developer: GOLDEN'S (Golden techS)
// ============================================

export type UserRole = 'company_owner' | 'company_manager' | 'salesman' | 'viewer'

export type Theme = 'system' | 'light' | 'dark' | 'golden_premium'

export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise'

export interface User {
  id: string
  email: string
  phone?: string
  role: UserRole
  created_at: string
  updated_at: string
  last_login?: string
  is_verified: boolean
  two_factor_enabled: boolean
  profile_completeness: number
}

export interface Company {
  id: string
  owner_id: string
  name: string
  ceo_name: string
  ceo_image?: string
  profile: string
  logo?: string
  address: Address
  production_types: string[]
  employee_count: number
  country: string
  phone: string
  email: string
  website?: string
  industry_category: string
  year_established: number
  annual_revenue_range?: string
  primary_language: string
  preferred_currency: Currency
  legal_entity_type: string
  tax_id?: string
  tax_id_verified: boolean
  tax_exempt: boolean
  operating_hours: OperatingHours[]
  social_links: SocialLinks
  accept_marketing: boolean
  subscription_plan: SubscriptionPlan
  created_at: string
  updated_at: string
}

export interface Address {
  street: string
  city: string
  state: string
  postal_code: string
  country: string
  lat?: number
  lng?: number
}

export interface OperatingHours {
  day: string
  open: string
  close: string
  is_closed: boolean
}

export interface SocialLinks {
  linkedin?: string
  twitter?: string
  instagram?: string
  youtube?: string
  snapchat?: string
  whatsapp?: string
}

export type Currency = 'USD' | 'AED' | 'INR' | 'CAD' | 'GBP' | 'EUR' | 'JPY'

export interface Product {
  id: string
  company_id: string
  name: string
  description: string
  images: string[]
  video_url?: string
  category: string
  subcategory?: string
  tags: string[]
  specifications: Record<string, string>
  price_range?: string
  moq?: number
  lead_time?: string
  is_featured: boolean
  is_trending: boolean
  is_new_arrival: boolean
  views: number
  likes: number
  created_at: string
  updated_at: string
}

export interface Reel {
  id: string
  company_id: string
  product_id?: string
  video_url: string
  thumbnail_url: string
  caption: string
  views: number
  likes: number
  duration: number
  created_at: string
}

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

export interface Wishlist {
  id: string
  user_id: string
  product_id: string
  added_at: string
}

export interface UserSettings {
  user_id: string
  // Display
  theme: Theme
  language: string
  font_size: 'small' | 'medium' | 'large'
  high_contrast: boolean
  reduced_motion: boolean
  // Notifications
  push_enabled: boolean
  email_notifications: boolean
  sound_enabled: boolean
  vibration_enabled: boolean
  // Privacy
  show_online_status: boolean
  show_last_seen: boolean
  allow_messages_from: 'everyone' | 'connections' | 'none'
  // General
  default_currency: Currency
  measurement_unit: 'metric' | 'imperial'
  date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  time_zone: string
  startup_page: 'home' | 'reels' | 'products' | 'last_visited'
  auto_play_reels: boolean
  infinite_scroll: boolean
  data_saver_mode: boolean
  // Security
  app_lock_enabled: boolean
  app_lock_pin?: string
  biometric_enabled: boolean
}

export interface SignUpFormData {
  // Account
  email: string
  password: string
  confirm_password: string
  phone: string
  // Company
  company_name: string
  ceo_name: string
  company_profile: string
  ceo_image?: File
  company_logo?: File
  // Address
  address: Address
  // Business Details
  production_types: string[]
  employee_count: number
  country: string
  website?: string
  industry_category: string
  year_established: number
  annual_revenue_range?: string
  primary_language: string
  preferred_currency: Currency
  legal_entity_type: string
  tax_id?: string
  tax_exempt: boolean
  operating_hours: OperatingHours[]
  social_links: SocialLinks
  // Consent
  accept_terms: boolean
  accept_marketing: boolean
  gdpr_consent: boolean
}

// Production types for dropdown
export const PRODUCTION_TYPES = [
  'Manufacturing',
  'Wholesale',
  'Retail',
  'Import/Export',
  'Agriculture',
  'Technology',
  'Healthcare',
  'Construction',
  'Automotive',
  'Textiles',
  'Food & Beverage',
  'Electronics',
  'Chemicals',
  'Pharmaceuticals',
  'Energy',
  'Mining',
  'Logistics',
  'Financial Services',
  'Real Estate',
  'Hospitality',
  'Education',
  'Media & Entertainment',
  'Other'
] as const

export const INDUSTRY_CATEGORIES = [
  'Manufacturing',
  'Retail',
  'Technology',
  'Healthcare',
  'Construction',
  'Agriculture',
  'Automotive',
  'Financial Services',
  'Real Estate',
  'Hospitality',
  'Education',
  'Media',
  'Other'
] as const

export const LEGAL_ENTITY_TYPES = [
  'LLC',
  'Corporation',
  'Partnership',
  'Sole Proprietorship',
  'Non-Profit',
  'Cooperative',
  'Other'
] as const

export const COUNTRIES = [
  'United States',
  'United Arab Emirates',
  'India',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Japan',
  'China',
  'Australia',
  'Brazil',
  'Mexico',
  'South Korea',
  'Italy',
  'Spain',
  'Netherlands',
  'Switzerland',
  'Singapore',
  'Saudi Arabia',
  'South Africa',
  'Other'
] as const

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ko', name: 'Korean' },
  { code: 'it', name: 'Italian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'cs', name: 'Czech' },
  { code: 'el', name: 'Greek' }
] as const

export const CURRENCIES: { code: Currency; symbol: string; name: string }[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
]

export const REVENUE_RANGES = [
  'Under $100K',
  '$100K - $500K',
  '$500K - $1M',
  '$1M - $5M',
  '$5M - $10M',
  '$10M - $50M',
  '$50M - $100M',
  'Over $100M',
  'Prefer not to say'
] as const

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const
