"use client"

// ============================================
// BIZLINK - Database Layer with Supabase Integration
// Developer: GOLDEN'S (Golden techS)
// 🟢🟢 Configure Supabase in lib/supabase.ts 🟢🟢
// ============================================

import { supabase, isSupabaseConfigured, db as supabaseDb, storage } from './supabase'
import type { User, Company, Product, Reel, Notification, UserSettings, UserRole } from './types'

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Safe localStorage wrapper
const store = {
  get: <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : fallback
    } catch { return fallback }
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    try { localStorage.removeItem(key) } catch {}
  }
}

// Storage keys
const K = {
  USER: 'biz_user',
  COMPANY: 'biz_company', 
  SETTINGS: 'biz_settings',
  SESSION: 'biz_session',
  PRODUCTS: 'biz_products',
  REELS: 'biz_reels',
  WISHLIST: 'biz_wishlist',
  NOTIFICATIONS: 'biz_notifications',
  ROLE: 'biz_role',
  SKIP_SPLASH: 'biz_skip_splash',
  PIN: 'biz_pin',
  NETWORK: 'biz_network',
  FEED: 'biz_feed',
  DRAFT_SIGNUP: 'biz_draft_signup',
}

// Demo data
const DEMO_COMPANIES: Company[] = [
  {
    id: 'c1', owner_id: 'u1', name: 'TechCorp Industries', ceo_name: 'John Smith',
    profile: 'Leading manufacturer of industrial automation', logo_url: '', ceo_image_url: '',
    address: '123 Tech Ave', city: 'San Francisco', state: 'CA', country: 'USA', postal_code: '94102',
    phone: '+1-555-0100', email: 'info@techcorp.com', website: 'techcorp.com',
    production_types: ['Manufacturing', 'Robotics'], employee_count: 250, year_established: 2010,
    industry: 'Manufacturing', currency: 'USD', tax_id: '', tax_verified: false, legal_entity: 'LLC',
    social_links: {}, operating_hours: {}, created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(), is_verified: true, subscription_plan: 'professional',
  },
  {
    id: 'c2', owner_id: 'u2', name: 'Global Materials', ceo_name: 'Sarah Lee',
    profile: 'Premium steel supplier worldwide', logo_url: '', ceo_image_url: '',
    address: '456 Steel St', city: 'Chicago', state: 'IL', country: 'USA', postal_code: '60601',
    phone: '+1-555-0200', email: 'sales@globalmaterials.com', website: 'globalmaterials.com',
    production_types: ['Materials', 'Steel'], employee_count: 500, year_established: 1995,
    industry: 'Materials', currency: 'USD', tax_id: '', tax_verified: false, legal_entity: 'Corporation',
    social_links: {}, operating_hours: {}, created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(), is_verified: true, subscription_plan: 'enterprise',
  },
]

const DEMO_PRODUCTS: Product[] = [
  { id: 'p1', company_id: 'c1', name: 'Robot Arm X500', description: 'High-precision 6-axis robotic arm', images: [], category: 'Robotics', tags: ['automation'], specifications: { Payload: '50kg' }, is_featured: true, is_trending: true, is_new_arrival: false, views: 1234, likes: 89, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p2', company_id: 'c2', name: 'Steel Sheets Pro', description: 'Premium stainless steel sheets', images: [], category: 'Materials', tags: ['steel'], specifications: { Grade: '304' }, is_featured: true, is_trending: false, is_new_arrival: true, views: 856, likes: 45, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p3', company_id: 'c1', name: 'Smart Conveyor', description: 'IoT-enabled conveyor system', images: [], category: 'Automation', tags: ['iot'], specifications: { Speed: '60m/min' }, is_featured: false, is_trending: true, is_new_arrival: true, views: 567, likes: 78, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p4', company_id: 'c2', name: 'Aluminum Profiles', description: 'Extruded aluminum for construction', images: [], category: 'Materials', tags: ['aluminum'], specifications: { Alloy: '6063' }, is_featured: false, is_trending: false, is_new_arrival: false, views: 234, likes: 23, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const DEMO_REELS: Reel[] = [
  { id: 'r1', company_id: 'c1', user_id: 'u1', title: 'Robot Demo', description: 'See our X500 in action!', video_url: '', thumbnail_url: '', duration: 30, views: 5432, likes: 234, shares: 56, comments_count: 23, tags: ['robot'], products_tagged: ['p1'], is_active: true, created_at: new Date().toISOString() },
  { id: 'r2', company_id: 'c2', user_id: 'u2', title: 'Steel Process', description: 'Behind the scenes', video_url: '', thumbnail_url: '', duration: 45, views: 3210, likes: 189, shares: 34, comments_count: 12, tags: ['steel'], products_tagged: ['p2'], is_active: true, created_at: new Date().toISOString() },
]

// Initialize demo data
function initDemo() {
  if (typeof window === 'undefined') return
  if (store.get<Product[]>(K.PRODUCTS, []).length === 0) {
    store.set(K.PRODUCTS, DEMO_PRODUCTS)
    store.set(K.REELS, DEMO_REELS)
  }
}
if (typeof window !== 'undefined') initDemo()

// ============================================
// AUTH
// ============================================
export const auth = {
  async signUp(email: string, password: string, role: UserRole): Promise<{ user: User | null; error: string | null }> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { role } } })
      if (error) return { user: null, error: error.message }
      const user: User = { id: data.user!.id, email, role, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_verified: false, two_factor_enabled: false, profile_completeness: 10 }
      store.set(K.USER, user)
      store.set(K.SESSION, { id: user.id })
      return { user, error: null }
    }
    const user: User = { id: generateId(), email, role, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_verified: false, two_factor_enabled: false, profile_completeness: 10 }
    store.set(K.USER, user)
    store.set(K.SESSION, { id: user.id })
    return { user, error: null }
  },

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { user: null, error: error.message }
      const user: User = { id: data.user!.id, email: data.user!.email!, role: (data.user!.user_metadata?.role as UserRole) || 'company_owner', created_at: data.user!.created_at, updated_at: new Date().toISOString(), is_verified: true, two_factor_enabled: false, profile_completeness: 50 }
      store.set(K.USER, user)
      store.set(K.SESSION, { id: user.id })
      return { user, error: null }
    }
    // Demo login - create user if not exists
    let user = store.get<User | null>(K.USER, null)
    if (!user || user.email !== email) {
      user = { id: generateId(), email, role: 'company_owner', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_verified: true, two_factor_enabled: false, profile_completeness: 50 }
    }
    store.set(K.USER, user)
    store.set(K.SESSION, { id: user.id })
    return { user, error: null }
  },

  async signInWithGoogle(): Promise<{ user: User | null; error: string | null }> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
      if (error) return { user: null, error: error.message }
      return { user: null, error: null }
    }
    const user: User = { id: generateId(), email: 'demo@golden.tech', role: 'company_owner', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_verified: true, two_factor_enabled: false, profile_completeness: 20 }
    store.set(K.USER, user)
    store.set(K.SESSION, { id: user.id })
    return { user, error: null }
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured() && supabase) await supabase.auth.signOut()
    store.remove(K.SESSION)
  },

  async getSession(): Promise<{ user: User | null }> {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        const user: User = { id: data.session.user.id, email: data.session.user.email!, role: (data.session.user.user_metadata?.role as UserRole) || 'company_owner', created_at: data.session.user.created_at, updated_at: new Date().toISOString(), is_verified: true, two_factor_enabled: false, profile_completeness: 50 }
        return { user }
      }
    }
    const session = store.get<{ id: string } | null>(K.SESSION, null)
    if (!session) return { user: null }
    return { user: store.get<User | null>(K.USER, null) }
  },

  async resetPassword(email: string): Promise<{ error: string | null }> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) return { error: error.message }
    }
    return { error: null }
  },

  async verifyOTP(_email: string, otp: string): Promise<{ valid: boolean }> {
    return { valid: otp.length === 6 }
  },

  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) return { error: error.message }
    }
    return { error: null }
  },
}

// ============================================
// USERS
// ============================================
export const users = {
  async get(_userId: string): Promise<User | null> {
    return store.get<User | null>(K.USER, null)
  },
  async update(userId: string, data: Partial<User>): Promise<{ user: User | null; error: string | null }> {
    const user = store.get<User | null>(K.USER, null)
    if (!user) return { user: null, error: 'Not found' }
    const updated = { ...user, ...data, updated_at: new Date().toISOString() }
    store.set(K.USER, updated)
    return { user: updated, error: null }
  },
}

// ============================================
// COMPANIES
// ============================================
export const companies = {
  async list(): Promise<Company[]> {
    if (isSupabaseConfigured()) {
      const { data } = await supabaseDb.companies.list()
      return (data as Company[]) || []
    }
    return DEMO_COMPANIES
  },
  async get(id: string): Promise<Company | null> {
    if (isSupabaseConfigured()) {
      const { data } = await supabaseDb.companies.get(id)
      return data as Company | null
    }
    const company = store.get<Company | null>(K.COMPANY, null)
    if (company?.id === id) return company
    return DEMO_COMPANIES.find(c => c.id === id) || null
  },
  async getByOwner(ownerId: string): Promise<Company | null> {
    const company = store.get<Company | null>(K.COMPANY, null)
    return company?.owner_id === ownerId ? company : null
  },
  async create(data: Partial<Company>): Promise<{ company: Company | null; error: string | null }> {
    const company: Company = {
      id: generateId(), owner_id: data.owner_id || '', name: data.name || '', ceo_name: data.ceo_name || '',
      profile: data.profile || '', logo_url: data.logo_url || '', ceo_image_url: data.ceo_image_url || '',
      address: data.address || '', city: data.city || '', state: data.state || '', country: data.country || '',
      postal_code: data.postal_code || '', phone: data.phone || '', email: data.email || '',
      website: data.website || '', production_types: data.production_types || [], employee_count: data.employee_count || 0,
      year_established: data.year_established || new Date().getFullYear(), industry: data.industry || '',
      currency: data.currency || 'USD', tax_id: data.tax_id || '', tax_verified: false, legal_entity: data.legal_entity || '',
      social_links: data.social_links || {}, operating_hours: data.operating_hours || {},
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_verified: false, subscription_plan: 'starter',
    }
    store.set(K.COMPANY, company)
    return { company, error: null }
  },
  async update(id: string, data: Partial<Company>): Promise<{ company: Company | null; error: string | null }> {
    const company = store.get<Company | null>(K.COMPANY, null)
    if (!company || company.id !== id) return { company: null, error: 'Not found' }
    const updated = { ...company, ...data, updated_at: new Date().toISOString() }
    store.set(K.COMPANY, updated)
    return { company: updated, error: null }
  },
}

// ============================================
// PRODUCTS
// ============================================
export const products = {
  async list(companyId?: string): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      const { data } = await supabaseDb.products.list({ company_id: companyId })
      return (data as Product[]) || []
    }
    const all = store.get<Product[]>(K.PRODUCTS, DEMO_PRODUCTS)
    return companyId ? all.filter(p => p.company_id === companyId) : all
  },
  async get(id: string): Promise<Product | null> {
    const all = store.get<Product[]>(K.PRODUCTS, DEMO_PRODUCTS)
    return all.find(p => p.id === id) || null
  },
  async create(data: Partial<Product>): Promise<Product> {
    const product: Product = {
      id: generateId(), company_id: data.company_id || '', name: data.name || '',
      description: data.description || '', images: data.images || [], category: data.category || '',
      tags: data.tags || [], specifications: data.specifications || {}, is_featured: false,
      is_trending: false, is_new_arrival: true, views: 0, likes: 0,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }
    const all = store.get<Product[]>(K.PRODUCTS, DEMO_PRODUCTS)
    all.unshift(product)
    store.set(K.PRODUCTS, all)
    return product
  },
  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    const all = store.get<Product[]>(K.PRODUCTS, DEMO_PRODUCTS)
    const idx = all.findIndex(p => p.id === id)
    if (idx === -1) return null
    all[idx] = { ...all[idx], ...data, updated_at: new Date().toISOString() }
    store.set(K.PRODUCTS, all)
    return all[idx]
  },
  async delete(id: string): Promise<void> {
    const all = store.get<Product[]>(K.PRODUCTS, DEMO_PRODUCTS)
    store.set(K.PRODUCTS, all.filter(p => p.id !== id))
  },
  async incrementViews(id: string): Promise<void> {
    const all = store.get<Product[]>(K.PRODUCTS, DEMO_PRODUCTS)
    const idx = all.findIndex(p => p.id === id)
    if (idx !== -1) { all[idx].views++; store.set(K.PRODUCTS, all) }
  },
  async toggleLike(id: string): Promise<void> {
    const all = store.get<Product[]>(K.PRODUCTS, DEMO_PRODUCTS)
    const idx = all.findIndex(p => p.id === id)
    if (idx !== -1) { all[idx].likes++; store.set(K.PRODUCTS, all) }
  },
}

// ============================================
// REELS
// ============================================
export const reels = {
  async list(companyId?: string): Promise<Reel[]> {
    const all = store.get<Reel[]>(K.REELS, DEMO_REELS)
    return companyId ? all.filter(r => r.company_id === companyId) : all
  },
  async get(id: string): Promise<Reel | null> {
    const all = store.get<Reel[]>(K.REELS, DEMO_REELS)
    return all.find(r => r.id === id) || null
  },
  async create(data: Partial<Reel>): Promise<Reel> {
    const reel: Reel = {
      id: generateId(), company_id: data.company_id || '', user_id: data.user_id || '',
      title: data.title || '', description: data.description || '', video_url: data.video_url || '',
      thumbnail_url: data.thumbnail_url || '', duration: data.duration || 0, views: 0, likes: 0,
      shares: 0, comments_count: 0, tags: data.tags || [], products_tagged: data.products_tagged || [],
      is_active: true, created_at: new Date().toISOString(),
    }
    const all = store.get<Reel[]>(K.REELS, DEMO_REELS)
    all.unshift(reel)
    store.set(K.REELS, all)
    return reel
  },
  async delete(id: string): Promise<void> {
    const all = store.get<Reel[]>(K.REELS, DEMO_REELS)
    store.set(K.REELS, all.filter(r => r.id !== id))
  },
  async incrementViews(id: string): Promise<void> {
    const all = store.get<Reel[]>(K.REELS, DEMO_REELS)
    const idx = all.findIndex(r => r.id === id)
    if (idx !== -1) { all[idx].views++; store.set(K.REELS, all) }
  },
  async toggleLike(id: string): Promise<void> {
    const all = store.get<Reel[]>(K.REELS, DEMO_REELS)
    const idx = all.findIndex(r => r.id === id)
    if (idx !== -1) { all[idx].likes++; store.set(K.REELS, all) }
  },
}

// ============================================
// WISHLIST
// ============================================
export const wishlist = {
  async list(userId: string): Promise<string[]> {
    return store.get<string[]>(`${K.WISHLIST}_${userId}`, [])
  },
  async add(userId: string, productId: string): Promise<void> {
    const list = store.get<string[]>(`${K.WISHLIST}_${userId}`, [])
    if (!list.includes(productId)) { list.push(productId); store.set(`${K.WISHLIST}_${userId}`, list) }
  },
  async remove(userId: string, productId: string): Promise<void> {
    const list = store.get<string[]>(`${K.WISHLIST}_${userId}`, [])
    store.set(`${K.WISHLIST}_${userId}`, list.filter(id => id !== productId))
  },
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    return store.get<string[]>(`${K.WISHLIST}_${userId}`, []).includes(productId)
  },
}

// ============================================
// NOTIFICATIONS
// ============================================
export const notifications = {
  async list(userId: string): Promise<Notification[]> {
    return store.get<Notification[]>(`${K.NOTIFICATIONS}_${userId}`, [])
  },
  async add(userId: string, n: Partial<Notification>): Promise<Notification> {
    const notification: Notification = { id: generateId(), user_id: userId, type: n.type || 'system', title: n.title || '', message: n.message || '', data: n.data || {}, read: false, created_at: new Date().toISOString() }
    const list = store.get<Notification[]>(`${K.NOTIFICATIONS}_${userId}`, [])
    list.unshift(notification)
    store.set(`${K.NOTIFICATIONS}_${userId}`, list)
    return notification
  },
  async markAsRead(userId: string, id: string): Promise<void> {
    const list = store.get<Notification[]>(`${K.NOTIFICATIONS}_${userId}`, [])
    const idx = list.findIndex(n => n.id === id)
    if (idx !== -1) { list[idx].read = true; store.set(`${K.NOTIFICATIONS}_${userId}`, list) }
  },
  async markAllRead(userId: string): Promise<void> {
    const list = store.get<Notification[]>(`${K.NOTIFICATIONS}_${userId}`, [])
    list.forEach(n => n.read = true)
    store.set(`${K.NOTIFICATIONS}_${userId}`, list)
  },
  async getUnreadCount(userId: string): Promise<number> {
    return store.get<Notification[]>(`${K.NOTIFICATIONS}_${userId}`, []).filter(n => !n.read).length
  },
}

// ============================================
// SETTINGS
// ============================================
export const settings = {
  async get(userId: string): Promise<UserSettings> {
    return store.get<UserSettings>(`${K.SETTINGS}_${userId}`, {
      user_id: userId, theme: 'system', language: 'en', font_size: 'medium', high_contrast: false,
      reduced_motion: false, push_enabled: true, email_notifications: true, sound_enabled: true,
      vibration_enabled: true, show_online_status: true, show_last_seen: true, allow_messages_from: 'everyone',
      default_currency: 'USD', measurement_unit: 'metric', date_format: 'DD/MM/YYYY',
      time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone, startup_page: 'home',
      auto_play_reels: true, infinite_scroll: true, data_saver_mode: false, app_lock_enabled: false, biometric_enabled: false,
    })
  },
  async update(userId: string, data: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.get(userId)
    const updated = { ...current, ...data }
    store.set(`${K.SETTINGS}_${userId}`, updated)
    return updated
  },
}

// ============================================
// APP STATE
// ============================================
export const appState = {
  setSkipSplash: (v: boolean) => store.set(K.SKIP_SPLASH, v),
  shouldSkipSplash: () => store.get<boolean>(K.SKIP_SPLASH, false),
  setSelectedRole: (r: UserRole) => store.set(K.ROLE, r),
  getSelectedRole: () => store.get<UserRole | null>(K.ROLE, null),
  setAppLockPin: (p: string) => store.set(K.PIN, p),
  getAppLockPin: () => store.get<string | null>(K.PIN, null),
  verifyAppLockPin: (p: string) => store.get<string | null>(K.PIN, null) === p,
}

// ============================================
// FILE UPLOAD
// ============================================
export const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await storage.upload(bucket, path, file)
    if (error || !data) return null
    return storage.getPublicUrl(bucket, data.path)
  }
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

export function clearAllData(): void {
  Object.values(K).forEach(k => store.remove(k))
}

// ============================================
// DRAFT SIGNUP (Save-as-draft functionality)
// ============================================
export const draftSignup = {
  async save(userId: string, data: Record<string, unknown>): Promise<void> {
    store.set(`${K.DRAFT_SIGNUP}_${userId}`, { ...data, savedAt: new Date().toISOString() })
  },
  async get(userId: string): Promise<Record<string, unknown> | null> {
    return store.get<Record<string, unknown> | null>(`${K.DRAFT_SIGNUP}_${userId}`, null)
  },
  async clear(userId: string): Promise<void> {
    store.remove(`${K.DRAFT_SIGNUP}_${userId}`)
  },
  async hasDraft(userId: string): Promise<boolean> {
    return store.get<Record<string, unknown> | null>(`${K.DRAFT_SIGNUP}_${userId}`, null) !== null
  },
}
