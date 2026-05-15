"use client"

// ============================================
// BIZLINK — Database Layer
// Developer: GOLDEN'S (Golden techS)
// All reads/writes go to Supabase.
// Media uploads go to Backblaze B2 via /api/upload.
// No fake demo data — blank state until Supabase is wired.
// 🟢🟢 See lib/supabase.ts & lib/backblaze.ts 🟢🟢
// ============================================

import { supabase, isSupabaseReady } from './supabase'
import { uploadToB2, b2PublicUrl } from './backblaze'
import type { User, Company, Product, Reel, Notification, UserRole } from './types'

// ─── tiny localStorage shim (for session only) ───
const ls = {
  get: <T>(key: string, fb: T): T => {
    if (typeof window === 'undefined') return fb
    try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fb } catch { return fb }
  },
  set: <T>(key: string, v: T) => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem(key, JSON.stringify(v)) } catch {}
  },
  del: (key: string) => { if (typeof window !== 'undefined') try { localStorage.removeItem(key) } catch {} },
}

const SESSION_KEY = 'bizlink-session-user'

// ──────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────
export const auth = {
  async signUp(
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ user: User | null; error: string | null }> {
    if (!isSupabaseReady() || !supabase)
      return { user: null, error: '🟢🟢 Supabase is not configured yet. Add credentials in lib/supabase.ts 🟢🟢' }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role } },
    })
    if (error) return { user: null, error: error.message }
    if (!data.user) return { user: null, error: 'Signup failed — no user returned.' }

    const user: User = {
      id: data.user.id,
      email,
      role,
      created_at: data.user.created_at,
      updated_at: new Date().toISOString(),
      is_verified: false,
      two_factor_enabled: false,
      profile_completeness: 10,
    }
    ls.set(SESSION_KEY, user)
    return { user, error: null }
  },

  async signIn(
    email: string,
    password: string
  ): Promise<{ user: User | null; error: string | null }> {
    if (!isSupabaseReady() || !supabase)
      return { user: null, error: '🟢🟢 Supabase is not configured yet. Add credentials in lib/supabase.ts 🟢🟢' }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { user: null, error: error.message }
    if (!data.user) return { user: null, error: 'Sign-in failed.' }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.full_name,
      avatar_url: data.user.user_metadata?.avatar_url,
      role: (data.user.user_metadata?.role as UserRole) ?? 'company_owner',
      created_at: data.user.created_at,
      updated_at: new Date().toISOString(),
      is_verified: !!data.user.email_confirmed_at,
      two_factor_enabled: false,
      profile_completeness: 50,
    }
    ls.set(SESSION_KEY, user)
    return { user, error: null }
  },

  /** Triggers Supabase Google OAuth — browser will redirect to Google. */
  async signInWithGoogle(): Promise<{ user: User | null; error: string | null; needsProfileCompletion?: boolean }> {
    if (!isSupabaseReady() || !supabase)
      return { user: null, error: '🟢🟢 Supabase is not configured yet. Add credentials in lib/supabase.ts 🟢🟢' }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) return { user: null, error: error.message }
    // Browser is now navigating — no user object returned here.
    return { user: null, error: null }
  },

  async getSession(): Promise<{ user: User | null }> {
    if (isSupabaseReady() && supabase) {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        const su = data.session.user
        const user: User = {
          id: su.id,
          email: su.email!,
          name: su.user_metadata?.full_name,
          avatar_url: su.user_metadata?.avatar_url,
          role: (su.user_metadata?.role as UserRole) ?? 'company_owner',
          created_at: su.created_at,
          updated_at: new Date().toISOString(),
          is_verified: !!su.email_confirmed_at,
          two_factor_enabled: false,
          profile_completeness: 50,
        }
        ls.set(SESSION_KEY, user)
        return { user }
      }
    }
    return { user: ls.get<User | null>(SESSION_KEY, null) }
  },

  async signOut(): Promise<void> {
    if (isSupabaseReady() && supabase) await supabase.auth.signOut()
    ls.del(SESSION_KEY)
  },

  async resetPassword(email: string): Promise<{ error: string | null }> {
    if (!isSupabaseReady() || !supabase)
      return { error: '🟢🟢 Supabase not configured 🟢🟢' }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error: error?.message ?? null }
  },

  async verifyOTP(email: string, token: string): Promise<{ valid: boolean; error: string | null }> {
    if (!isSupabaseReady() || !supabase) return { valid: false, error: '🟢🟢 Supabase not configured 🟢🟢' }
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    return { valid: !error, error: error?.message ?? null }
  },

  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    if (!isSupabaseReady() || !supabase) return { error: '🟢🟢 Supabase not configured 🟢🟢' }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error: error?.message ?? null }
  },
}

// ──────────────────────────────────────────────
// COMPANIES
// ──────────────────────────────────────────────
export const companies = {
  async list(filters?: { country?: string; industry?: string }): Promise<Company[]> {
    if (!isSupabaseReady() || !supabase) return []
    let q = supabase.from('companies').select('*')
    if (filters?.country) q = q.eq('country', filters.country)
    if (filters?.industry) q = q.eq('industry', filters.industry)
    const { data } = await q.order('created_at', { ascending: false }).limit(50)
    return (data ?? []) as Company[]
  },

  async get(id: string): Promise<Company | null> {
    if (!isSupabaseReady() || !supabase) return null
    const { data } = await supabase.from('companies').select('*').eq('id', id).single()
    return (data as Company) ?? null
  },

  async getByOwner(ownerId: string): Promise<Company | null> {
    if (!isSupabaseReady() || !supabase) return null
    const { data } = await supabase.from('companies').select('*').eq('owner_id', ownerId).maybeSingle()
    return (data as Company) ?? null
  },

  async create(data: Partial<Company>): Promise<{ company: Company | null; error: string | null }> {
    if (!isSupabaseReady() || !supabase)
      return { company: null, error: '🟢🟢 Supabase not configured 🟢🟢' }
    const { data: row, error } = await supabase.from('companies').insert(data).select().single()
    return { company: (row as Company) ?? null, error: error?.message ?? null }
  },

  async update(id: string, data: Partial<Company>): Promise<{ company: Company | null; error: string | null }> {
    if (!isSupabaseReady() || !supabase)
      return { company: null, error: '🟢🟢 Supabase not configured 🟢🟢' }
    const { data: row, error } = await supabase
      .from('companies')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { company: (row as Company) ?? null, error: error?.message ?? null }
  },

  /** Upload a logo/CEO image to B2 and return the public URL. */
  async uploadImage(
    file: File,
    type: 'logos' | 'avatars'
  ): Promise<{ url: string; error: string | null }> {
    const { url, error } = await uploadToB2(file, type)
    return { url, error }
  },
}

// ──────────────────────────────────────────────
// PRODUCTS
// ──────────────────────────────────────────────
export const products = {
  async list(companyId?: string, limit = 30): Promise<Product[]> {
    if (!isSupabaseReady() || !supabase) return []
    let q = supabase
      .from('products')
      .select('*, company:companies(name, logo_url)')
      .eq('is_active', true)
    if (companyId) q = q.eq('company_id', companyId)
    const { data } = await q.order('created_at', { ascending: false }).limit(limit)
    const rows = (data ?? []) as Product[]
    // Resolve B2 image URLs
    return rows.map(p => ({ ...p, images: (p.images ?? []).map(b2PublicUrl) }))
  },

  async get(id: string): Promise<Product | null> {
    if (!isSupabaseReady() || !supabase) return null
    const { data } = await supabase
      .from('products')
      .select('*, company:companies(name, logo_url)')
      .eq('id', id)
      .single()
    if (!data) return null
    const p = data as Product
    return { ...p, images: (p.images ?? []).map(b2PublicUrl) }
  },

  async create(
    data: Partial<Product>,
    imageFiles: File[]
  ): Promise<{ product: Product | null; error: string | null }> {
    if (!isSupabaseReady() || !supabase)
      return { product: null, error: '🟢🟢 Supabase not configured 🟢🟢' }

    // Upload images to B2 first
    const imagePaths: string[] = []
    for (const file of imageFiles) {
      const { path, error } = await uploadToB2(file, 'products')
      if (error) return { product: null, error }
      imagePaths.push(path)
    }

    const { data: row, error } = await supabase
      .from('products')
      .insert({ ...data, images: imagePaths, is_active: true })
      .select()
      .single()
    return { product: (row as Product) ?? null, error: error?.message ?? null }
  },

  async update(id: string, data: Partial<Product>): Promise<{ product: Product | null; error: string | null }> {
    if (!isSupabaseReady() || !supabase)
      return { product: null, error: '🟢🟢 Supabase not configured 🟢🟢' }
    const { data: row, error } = await supabase
      .from('products')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { product: (row as Product) ?? null, error: error?.message ?? null }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    if (!isSupabaseReady() || !supabase)
      return { error: '🟢🟢 Supabase not configured 🟢🟢' }
    const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id)
    return { error: error?.message ?? null }
  },

  async incrementViews(id: string): Promise<void> {
    if (!isSupabaseReady() || !supabase) return
    await supabase.rpc('increment_product_views', { product_id: id })
  },

  async toggleLike(id: string, userId: string): Promise<void> {
    if (!isSupabaseReady() || !supabase) return
    await supabase.rpc('toggle_product_like', { p_product_id: id, p_user_id: userId })
  },
}

// ──────────────────────────────────────────────
// REELS
// ──────────────────────────────────────────────
export const reels = {
  async list(companyId?: string, limit = 20): Promise<Reel[]> {
    if (!isSupabaseReady() || !supabase) return []
    let q = supabase
      .from('reels')
      .select('*, company:companies(name, logo_url)')
      .eq('is_active', true)
    if (companyId) q = q.eq('company_id', companyId)
    const { data } = await q.order('created_at', { ascending: false }).limit(limit)
    const rows = (data ?? []) as Reel[]
    return rows.map(r => ({
      ...r,
      video_url: b2PublicUrl(r.video_url),
      thumbnail_url: r.thumbnail_url ? b2PublicUrl(r.thumbnail_url) : '',
    }))
  },

  async get(id: string): Promise<Reel | null> {
    if (!isSupabaseReady() || !supabase) return null
    const { data } = await supabase
      .from('reels')
      .select('*, company:companies(name, logo_url)')
      .eq('id', id)
      .single()
    if (!data) return null
    const r = data as Reel
    return {
      ...r,
      video_url: b2PublicUrl(r.video_url),
      thumbnail_url: r.thumbnail_url ? b2PublicUrl(r.thumbnail_url) : '',
    }
  },

  async create(
    data: Partial<Reel>,
    videoFile: File,
    thumbnailFile?: File
  ): Promise<{ reel: Reel | null; error: string | null }> {
    if (!isSupabaseReady() || !supabase)
      return { reel: null, error: '🟢🟢 Supabase not configured 🟢🟢' }

    // Upload video to B2
    const { path: videoPath, error: videoErr } = await uploadToB2(videoFile, 'reels')
    if (videoErr) return { reel: null, error: videoErr }

    let thumbnailPath = ''
    if (thumbnailFile) {
      const { path, error } = await uploadToB2(thumbnailFile, 'products')
      if (error) return { reel: null, error }
      thumbnailPath = path
    }

    const { data: row, error } = await supabase
      .from('reels')
      .insert({ ...data, video_url: videoPath, thumbnail_url: thumbnailPath, is_active: true })
      .select()
      .single()
    return { reel: (row as Reel) ?? null, error: error?.message ?? null }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    if (!isSupabaseReady() || !supabase)
      return { error: '🟢🟢 Supabase not configured 🟢🟢' }
    const { error } = await supabase.from('reels').update({ is_active: false }).eq('id', id)
    return { error: error?.message ?? null }
  },

  async incrementViews(id: string): Promise<void> {
    if (!isSupabaseReady() || !supabase) return
    await supabase.rpc('increment_reel_views', { reel_id: id })
  },
}

// ──────────────────────────────────────────────
// WISHLIST
// ──────────────────────────────────────────────
export const wishlist = {
  async list(userId: string): Promise<Product[]> {
    if (!isSupabaseReady() || !supabase) return []
    const { data } = await supabase
      .from('wishlist')
      .select('product:products(*, company:companies(name, logo_url))')
      .eq('user_id', userId)
    return ((data ?? []).map((r: Record<string, unknown>) => r.product).filter(Boolean) as Product[]).map(p => ({
      ...p,
      images: (p.images ?? []).map(b2PublicUrl),
    }))
  },

  async add(userId: string, productId: string): Promise<{ error: string | null }> {
    if (!isSupabaseReady() || !supabase) return { error: '🟢🟢 Supabase not configured 🟢🟢' }
    const { error } = await supabase.from('wishlist').upsert({ user_id: userId, product_id: productId })
    return { error: error?.message ?? null }
  },

  async remove(userId: string, productId: string): Promise<{ error: string | null }> {
    if (!isSupabaseReady() || !supabase) return { error: '🟢🟢 Supabase not configured 🟢🟢' }
    const { error } = await supabase.from('wishlist').delete().eq('user_id', userId).eq('product_id', productId)
    return { error: error?.message ?? null }
  },

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    if (!isSupabaseReady() || !supabase) return false
    const { data } = await supabase.from('wishlist').select('id').eq('user_id', userId).eq('product_id', productId).maybeSingle()
    return !!data
  },
}

// ──────────────────────────────────────────────
// NOTIFICATIONS
// ──────────────────────────────────────────────
export const notifications = {
  async list(userId: string): Promise<Notification[]> {
    if (!isSupabaseReady() || !supabase) return []
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    return (data ?? []) as unknown as Notification[]
  },

  async markAsRead(id: string): Promise<void> {
    if (!isSupabaseReady() || !supabase) return
    await supabase.from('notifications').update({ read: true }).eq('id', id)
  },

  async markAllRead(userId: string): Promise<void> {
    if (!isSupabaseReady() || !supabase) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
  },

  async unreadCount(userId: string): Promise<number> {
    if (!isSupabaseReady() || !supabase) return 0
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)
    return count ?? 0
  },
}

// ──────────────────────────────────────────────
// SETTINGS
// ──────────────────────────────────────────────
export const settings = {
  async update(userId: string, data: Record<string, unknown>): Promise<{ error: string | null }> {
    if (!isSupabaseReady() || !supabase) return { error: null } // silently succeed — Zustand persists locally
    const { error } = await supabase.from('user_settings').upsert({ user_id: userId, ...data, updated_at: new Date().toISOString() })
    return { error: error?.message ?? null }
  },

  async get(userId: string): Promise<Record<string, unknown> | null> {
    if (!isSupabaseReady() || !supabase) return null
    const { data } = await supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle()
    return data as Record<string, unknown> | null
  },
}

// ──────────────────────────────────────────────
// APP STATE (thin localStorage shim used by main page)
// ──────────────────────────────────────────────
export const appState = {
  setSkipSplash: (v: boolean) => ls.set('bizlink-skip-splash', v),
  shouldSkipSplash: (): boolean => ls.get('bizlink-skip-splash', false),
  setSelectedRole: (role: string) => ls.set('bizlink-role', role),
  getSelectedRole: (): string | null => ls.get<string | null>('bizlink-role', null),
}

// ──────────────────────────────────────────────
// DRAFT SIGNUP
// ──────────────────────────────────────────────
export const draftSignup = {
  async save(userId: string, data: Record<string, unknown>): Promise<void> {
    ls.set(`bizlink-draft-${userId}`, { ...data, savedAt: new Date().toISOString() })
  },
  async get(userId: string): Promise<Record<string, unknown> | null> {
    return ls.get<Record<string, unknown> | null>(`bizlink-draft-${userId}`, null)
  },
  async clear(userId: string): Promise<void> {
    ls.del(`bizlink-draft-${userId}`)
  },
}

// ──────────────────────────────────────────────
// REALTIME
// ──────────────────────────────────────────────
export const realtime = {
  subscribeToMessages(chatId: string, cb: (msg: Record<string, unknown>) => void) {
    if (!isSupabaseReady() || !supabase) return null
    return supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, p => cb(p.new))
      .subscribe()
  },
  subscribeToNotifications(userId: string, cb: (n: Record<string, unknown>) => void) {
    if (!isSupabaseReady() || !supabase) return null
    return supabase
      .channel(`notifs:${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, p => cb(p.new))
      .subscribe()
  },
  unsubscribe(channel: ReturnType<NonNullable<typeof supabase>['channel']> | null) {
    if (!supabase || !channel) return
    supabase.removeChannel(channel)
  },
}
