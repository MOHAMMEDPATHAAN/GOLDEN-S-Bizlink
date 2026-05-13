// ============================================
// BIZLINK - Mock Database Layer
// Developer: GOLDEN'S (Golden techS)
// This layer mirrors Supabase structure for easy migration
// ============================================

import type {
  User,
  Company,
  Product,
  Reel,
  Chat,
  Message,
  Notification,
  Wishlist,
  UserSettings,
  UserRole,
} from './types'

const STORAGE_KEYS = {
  USER: 'bizlink_user',
  COMPANY: 'bizlink_company',
  SETTINGS: 'bizlink_settings',
  SESSION: 'bizlink_session',
  PRODUCTS: 'bizlink_products',
  REELS: 'bizlink_reels',
  CHATS: 'bizlink_chats',
  MESSAGES: 'bizlink_messages',
  NOTIFICATIONS: 'bizlink_notifications',
  WISHLIST: 'bizlink_wishlist',
  DRAFT_SIGNUP: 'bizlink_draft_signup',
  SKIP_SPLASH: 'bizlink_skip_splash',
  SELECTED_ROLE: 'bizlink_selected_role',
  APP_LOCK_PIN: 'bizlink_app_lock_pin',
} as const

// Helper functions
function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  const item = localStorage.getItem(key)
  return item ? JSON.parse(item) : null
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

function removeItem(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(key)
}

// Generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================
// AUTH FUNCTIONS
// ============================================

export const auth = {
  async signUp(email: string, password: string, role: UserRole): Promise<{ user: User | null; error: string | null }> {
    // Check if user exists
    const existingUser = getItem<User>(STORAGE_KEYS.USER)
    if (existingUser && existingUser.email === email) {
      return { user: null, error: 'User already exists with this email' }
    }

    const user: User = {
      id: generateId(),
      email,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_verified: false,
      two_factor_enabled: false,
      profile_completeness: 10,
    }

    setItem(STORAGE_KEYS.USER, user)
    setItem(STORAGE_KEYS.SESSION, { user_id: user.id, expires_at: Date.now() + 30 * 60 * 1000 })
    
    return { user, error: null }
  },

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    const user = getItem<User>(STORAGE_KEYS.USER)
    
    if (!user || user.email !== email) {
      return { user: null, error: 'Invalid email or password' }
    }

    // Update last login
    user.last_login = new Date().toISOString()
    setItem(STORAGE_KEYS.USER, user)
    setItem(STORAGE_KEYS.SESSION, { user_id: user.id, expires_at: Date.now() + 30 * 60 * 1000 })

    return { user, error: null }
  },

  async signInWithGoogle(): Promise<{ user: User | null; error: string | null }> {
    // Mock Google sign-in
    const user: User = {
      id: generateId(),
      email: 'demo@golden.tech',
      role: 'company_owner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_verified: true,
      two_factor_enabled: false,
      profile_completeness: 20,
    }

    setItem(STORAGE_KEYS.USER, user)
    setItem(STORAGE_KEYS.SESSION, { user_id: user.id, expires_at: Date.now() + 30 * 60 * 1000 })

    return { user, error: null }
  },

  async signOut(): Promise<void> {
    removeItem(STORAGE_KEYS.SESSION)
  },

  async getSession(): Promise<{ user: User | null }> {
    const session = getItem<{ user_id: string; expires_at: number }>(STORAGE_KEYS.SESSION)
    
    if (!session || session.expires_at < Date.now()) {
      removeItem(STORAGE_KEYS.SESSION)
      return { user: null }
    }

    const user = getItem<User>(STORAGE_KEYS.USER)
    return { user }
  },

  async resetPassword(email: string): Promise<{ error: string | null }> {
    // Mock password reset - send OTP
    return { error: null }
  },

  async verifyOTP(email: string, otp: string): Promise<{ valid: boolean }> {
    // Mock OTP verification - accept any 6-digit code
    return { valid: otp.length === 6 }
  },

  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    return { error: null }
  },

  async enable2FA(): Promise<{ secret: string; error: string | null }> {
    const user = getItem<User>(STORAGE_KEYS.USER)
    if (user) {
      user.two_factor_enabled = true
      setItem(STORAGE_KEYS.USER, user)
    }
    return { secret: 'MOCK2FASECRET', error: null }
  },
}

// ============================================
// USER FUNCTIONS
// ============================================

export const users = {
  async get(userId: string): Promise<User | null> {
    return getItem<User>(STORAGE_KEYS.USER)
  },

  async update(userId: string, data: Partial<User>): Promise<{ user: User | null; error: string | null }> {
    const user = getItem<User>(STORAGE_KEYS.USER)
    if (!user) return { user: null, error: 'User not found' }

    const updated = { ...user, ...data, updated_at: new Date().toISOString() }
    setItem(STORAGE_KEYS.USER, updated)
    return { user: updated, error: null }
  },
}

// ============================================
// COMPANY FUNCTIONS
// ============================================

export const companies = {
  async create(data: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<{ company: Company | null; error: string | null }> {
    const company: Company = {
      ...data,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setItem(STORAGE_KEYS.COMPANY, company)
    return { company, error: null }
  },

  async get(companyId: string): Promise<Company | null> {
    return getItem<Company>(STORAGE_KEYS.COMPANY)
  },

  async getByOwner(ownerId: string): Promise<Company | null> {
    const company = getItem<Company>(STORAGE_KEYS.COMPANY)
    return company?.owner_id === ownerId ? company : null
  },

  async update(companyId: string, data: Partial<Company>): Promise<{ company: Company | null; error: string | null }> {
    const company = getItem<Company>(STORAGE_KEYS.COMPANY)
    if (!company) return { company: null, error: 'Company not found' }

    const updated = { ...company, ...data, updated_at: new Date().toISOString() }
    setItem(STORAGE_KEYS.COMPANY, updated)
    return { company: updated, error: null }
  },
}

// ============================================
// SETTINGS FUNCTIONS
// ============================================

export const settings = {
  async get(userId: string): Promise<UserSettings> {
    const stored = getItem<UserSettings>(STORAGE_KEYS.SETTINGS)
    return stored || getDefaultSettings(userId)
  },

  async update(userId: string, data: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.get(userId)
    const updated = { ...current, ...data }
    setItem(STORAGE_KEYS.SETTINGS, updated)
    return updated
  },
}

function getDefaultSettings(userId: string): UserSettings {
  return {
    user_id: userId,
    theme: 'system',
    language: 'en',
    font_size: 'medium',
    high_contrast: false,
    reduced_motion: false,
    push_enabled: true,
    email_notifications: true,
    sound_enabled: true,
    vibration_enabled: true,
    show_online_status: true,
    show_last_seen: true,
    allow_messages_from: 'everyone',
    default_currency: 'USD',
    measurement_unit: 'metric',
    date_format: 'DD/MM/YYYY',
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    startup_page: 'home',
    auto_play_reels: true,
    infinite_scroll: true,
    data_saver_mode: false,
    app_lock_enabled: false,
    biometric_enabled: false,
  }
}

// ============================================
// PRODUCTS FUNCTIONS
// ============================================

export const products = {
  async list(companyId?: string): Promise<Product[]> {
    const all = getItem<Product[]>(STORAGE_KEYS.PRODUCTS) || []
    return companyId ? all.filter(p => p.company_id === companyId) : all
  },

  async get(productId: string): Promise<Product | null> {
    const all = getItem<Product[]>(STORAGE_KEYS.PRODUCTS) || []
    return all.find(p => p.id === productId) || null
  },

  async create(data: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'views' | 'likes'>): Promise<Product> {
    const product: Product = {
      ...data,
      id: generateId(),
      views: 0,
      likes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const all = getItem<Product[]>(STORAGE_KEYS.PRODUCTS) || []
    all.push(product)
    setItem(STORAGE_KEYS.PRODUCTS, all)
    return product
  },

  async incrementViews(productId: string): Promise<void> {
    const all = getItem<Product[]>(STORAGE_KEYS.PRODUCTS) || []
    const idx = all.findIndex(p => p.id === productId)
    if (idx !== -1) {
      all[idx].views++
      setItem(STORAGE_KEYS.PRODUCTS, all)
    }
  },

  async toggleLike(productId: string): Promise<void> {
    const all = getItem<Product[]>(STORAGE_KEYS.PRODUCTS) || []
    const idx = all.findIndex(p => p.id === productId)
    if (idx !== -1) {
      all[idx].likes++
      setItem(STORAGE_KEYS.PRODUCTS, all)
    }
  },
}

// ============================================
// WISHLIST FUNCTIONS
// ============================================

export const wishlist = {
  async list(userId: string): Promise<Wishlist[]> {
    const all = getItem<Wishlist[]>(STORAGE_KEYS.WISHLIST) || []
    return all.filter(w => w.user_id === userId)
  },

  async add(userId: string, productId: string): Promise<Wishlist> {
    const item: Wishlist = {
      id: generateId(),
      user_id: userId,
      product_id: productId,
      added_at: new Date().toISOString(),
    }
    const all = getItem<Wishlist[]>(STORAGE_KEYS.WISHLIST) || []
    all.push(item)
    setItem(STORAGE_KEYS.WISHLIST, all)
    return item
  },

  async remove(userId: string, productId: string): Promise<void> {
    const all = getItem<Wishlist[]>(STORAGE_KEYS.WISHLIST) || []
    const filtered = all.filter(w => !(w.user_id === userId && w.product_id === productId))
    setItem(STORAGE_KEYS.WISHLIST, filtered)
  },

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const all = getItem<Wishlist[]>(STORAGE_KEYS.WISHLIST) || []
    return all.some(w => w.user_id === userId && w.product_id === productId)
  },
}

// ============================================
// NOTIFICATIONS FUNCTIONS
// ============================================

export const notifications = {
  async list(userId: string): Promise<Notification[]> {
    const all = getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || []
    return all.filter(n => n.user_id === userId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  },

  async markAsRead(notificationId: string): Promise<void> {
    const all = getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || []
    const idx = all.findIndex(n => n.id === notificationId)
    if (idx !== -1) {
      all[idx].read = true
      setItem(STORAGE_KEYS.NOTIFICATIONS, all)
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    const all = getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || []
    return all.filter(n => n.user_id === userId && !n.read).length
  },
}

// ============================================
// CHAT FUNCTIONS
// ============================================

export const chats = {
  async list(userId: string): Promise<Chat[]> {
    const all = getItem<Chat[]>(STORAGE_KEYS.CHATS) || []
    return all.filter(c => c.participants.includes(userId))
  },

  async getMessages(chatId: string): Promise<Message[]> {
    const all = getItem<Message[]>(STORAGE_KEYS.MESSAGES) || []
    return all.filter(m => m.chat_id === chatId).sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  },

  async sendMessage(chatId: string, senderId: string, content: string, type: Message['type'] = 'text'): Promise<Message> {
    const message: Message = {
      id: generateId(),
      chat_id: chatId,
      sender_id: senderId,
      content,
      type,
      read: false,
      created_at: new Date().toISOString(),
    }
    const all = getItem<Message[]>(STORAGE_KEYS.MESSAGES) || []
    all.push(message)
    setItem(STORAGE_KEYS.MESSAGES, all)

    // Update chat's last message
    const chatsAll = getItem<Chat[]>(STORAGE_KEYS.CHATS) || []
    const idx = chatsAll.findIndex(c => c.id === chatId)
    if (idx !== -1) {
      chatsAll[idx].last_message = message
      chatsAll[idx].updated_at = new Date().toISOString()
      setItem(STORAGE_KEYS.CHATS, chatsAll)
    }

    return message
  },

  async getUnreadCount(userId: string): Promise<number> {
    const userChats = await this.list(userId)
    return userChats.reduce((count, chat) => count + chat.unread_count, 0)
  },
}

// ============================================
// REELS FUNCTIONS
// ============================================

export const reels = {
  async list(): Promise<Reel[]> {
    return getItem<Reel[]>(STORAGE_KEYS.REELS) || []
  },

  async create(data: Omit<Reel, 'id' | 'views' | 'likes' | 'created_at'>): Promise<Reel> {
    const reel: Reel = {
      ...data,
      id: generateId(),
      views: 0,
      likes: 0,
      created_at: new Date().toISOString(),
    }
    const all = getItem<Reel[]>(STORAGE_KEYS.REELS) || []
    all.push(reel)
    setItem(STORAGE_KEYS.REELS, all)
    return reel
  },

  async incrementViews(reelId: string): Promise<void> {
    const all = getItem<Reel[]>(STORAGE_KEYS.REELS) || []
    const idx = all.findIndex(r => r.id === reelId)
    if (idx !== -1) {
      all[idx].views++
      setItem(STORAGE_KEYS.REELS, all)
    }
  },
}

// ============================================
// DRAFT SIGNUP FUNCTIONS
// ============================================

export const draftSignup = {
  save(data: Record<string, unknown>): void {
    setItem(STORAGE_KEYS.DRAFT_SIGNUP, data)
  },

  get(): Record<string, unknown> | null {
    return getItem<Record<string, unknown>>(STORAGE_KEYS.DRAFT_SIGNUP)
  },

  clear(): void {
    removeItem(STORAGE_KEYS.DRAFT_SIGNUP)
  },
}

// ============================================
// APP STATE FUNCTIONS
// ============================================

export const appState = {
  setSkipSplash(skip: boolean): void {
    setItem(STORAGE_KEYS.SKIP_SPLASH, skip)
  },

  shouldSkipSplash(): boolean {
    return getItem<boolean>(STORAGE_KEYS.SKIP_SPLASH) || false
  },

  setSelectedRole(role: UserRole): void {
    setItem(STORAGE_KEYS.SELECTED_ROLE, role)
  },

  getSelectedRole(): UserRole | null {
    return getItem<UserRole>(STORAGE_KEYS.SELECTED_ROLE)
  },

  setAppLockPin(pin: string): void {
    setItem(STORAGE_KEYS.APP_LOCK_PIN, pin)
  },

  getAppLockPin(): string | null {
    return getItem<string>(STORAGE_KEYS.APP_LOCK_PIN)
  },

  verifyAppLockPin(pin: string): boolean {
    const stored = this.getAppLockPin()
    return stored === pin
  },
}

// ============================================
// CLEAR ALL DATA
// ============================================

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeItem(key)
  })
}
