"use client"

import { createClient } from '@supabase/supabase-js'

// 🟢🟢 SUPABASE CONFIGURATION 🟢🟢
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = '🟢🟢 YOUR_SUPABASE_URL 🟢🟢'
const SUPABASE_ANON_KEY = '🟢🟢 YOUR_SUPABASE_ANON_KEY 🟢🟢'

// Check if credentials are configured
export const isSupabaseConfigured = () => {
  return !SUPABASE_URL.includes('🟢🟢') && !SUPABASE_ANON_KEY.includes('🟢🟢')
}

// Create Supabase client (only if configured)
export const supabase = isSupabaseConfigured() 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null

// Database table types
export interface DbUser {
  id: string
  email: string
  phone?: string
  role: 'company_owner' | 'company_manager' | 'salesman' | 'viewer'
  created_at: string
  updated_at: string
  settings: Record<string, unknown>
  profile_complete: number
}

export interface DbCompany {
  id: string
  owner_id: string
  name: string
  ceo_name: string
  profile: string
  logo_url?: string
  ceo_image_url?: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  phone: string
  email: string
  website?: string
  production_types: string[]
  employee_count: number
  year_established: number
  industry: string
  currency: string
  tax_id?: string
  tax_verified: boolean
  legal_entity: string
  social_links: Record<string, string>
  operating_hours: Record<string, { open: string; close: string }>
  created_at: string
  updated_at: string
  is_verified: boolean
  subscription_plan: 'starter' | 'professional' | 'enterprise'
}

export interface DbProduct {
  id: string
  company_id: string
  name: string
  description: string
  category: string
  subcategory?: string
  price: number
  currency: string
  unit: string
  min_order: number
  max_order?: number
  images: string[]
  specifications: Record<string, string>
  tags: string[]
  is_active: boolean
  is_featured: boolean
  views: number
  likes: number
  created_at: string
  updated_at: string
}

export interface DbReel {
  id: string
  company_id: string
  user_id: string
  title: string
  description?: string
  video_url: string
  thumbnail_url?: string
  duration: number
  views: number
  likes: number
  shares: number
  comments_count: number
  tags: string[]
  products_tagged: string[]
  is_active: boolean
  created_at: string
}

export interface DbChat {
  id: string
  participants: string[]
  last_message?: string
  last_message_at?: string
  created_at: string
}

export interface DbMessage {
  id: string
  chat_id: string
  sender_id: string
  content: string
  type: 'text' | 'image' | 'file' | 'product'
  read_by: string[]
  created_at: string
}

export interface DbNotification {
  id: string
  user_id: string
  type: 'chat' | 'product' | 'order' | 'system' | 'network'
  title: string
  message: string
  data?: Record<string, unknown>
  read: boolean
  created_at: string
}

export interface DbWishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

export interface DbNetworkConnection {
  id: string
  requester_id: string
  target_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

export interface DbFeedPost {
  id: string
  company_id: string
  user_id: string
  content: string
  images: string[]
  likes: number
  comments_count: number
  shares: number
  created_at: string
}

// Auth helpers
export const signInWithEmail = async (email: string, password: string) => {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.auth.signInWithPassword({ email, password })
}

export const signUpWithEmail = async (email: string, password: string, metadata?: Record<string, unknown>) => {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.auth.signUp({ 
    email, 
    password,
    options: { data: metadata }
  })
}

export const signInWithGoogle = async () => {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
}

export const signOut = async () => {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.auth.signOut()
}

export const resetPassword = async (email: string) => {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })
}

export const updatePassword = async (newPassword: string) => {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.auth.updateUser({ password: newPassword })
}

export const getCurrentUser = async () => {
  if (!supabase) return { data: { user: null }, error: null }
  return supabase.auth.getUser()
}

export const getSession = async () => {
  if (!supabase) return { data: { session: null }, error: null }
  return supabase.auth.getSession()
}

// Database helpers
export const db = {
  // Users
  users: {
    get: async (id: string) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('users').select('*').eq('id', id).single()
    },
    create: async (data: Partial<DbUser>) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('users').insert(data).select().single()
    },
    update: async (id: string, data: Partial<DbUser>) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('users').update(data).eq('id', id).select().single()
    }
  },

  // Companies
  companies: {
    get: async (id: string) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('companies').select('*').eq('id', id).single()
    },
    getByOwner: async (ownerId: string) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('companies').select('*').eq('owner_id', ownerId).single()
    },
    list: async (filters?: { country?: string; industry?: string; limit?: number }) => {
      if (!supabase) return { data: [], error: { message: 'Supabase not configured' } }
      let query = supabase.from('companies').select('*')
      if (filters?.country) query = query.eq('country', filters.country)
      if (filters?.industry) query = query.eq('industry', filters.industry)
      if (filters?.limit) query = query.limit(filters.limit)
      return query.order('created_at', { ascending: false })
    },
    create: async (data: Partial<DbCompany>) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('companies').insert(data).select().single()
    },
    update: async (id: string, data: Partial<DbCompany>) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('companies').update(data).eq('id', id).select().single()
    }
  },

  // Products
  products: {
    get: async (id: string) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('products').select('*, companies(*)').eq('id', id).single()
    },
    list: async (filters?: { company_id?: string; category?: string; is_featured?: boolean; limit?: number; offset?: number }) => {
      if (!supabase) return { data: [], error: { message: 'Supabase not configured' } }
      let query = supabase.from('products').select('*, companies(name, logo_url)')
      if (filters?.company_id) query = query.eq('company_id', filters.company_id)
      if (filters?.category) query = query.eq('category', filters.category)
      if (filters?.is_featured) query = query.eq('is_featured', true)
      if (filters?.limit) query = query.limit(filters.limit)
      if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      return query.eq('is_active', true).order('created_at', { ascending: false })
    },
    create: async (data: Partial<DbProduct>) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('products').insert(data).select().single()
    },
    update: async (id: string, data: Partial<DbProduct>) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('products').update(data).eq('id', id).select().single()
    },
    delete: async (id: string) => {
      if (!supabase) return { error: { message: 'Supabase not configured' } }
      return supabase.from('products').delete().eq('id', id)
    },
    incrementViews: async (id: string) => {
      if (!supabase) return { error: { message: 'Supabase not configured' } }
      return supabase.rpc('increment_product_views', { product_id: id })
    },
    toggleLike: async (productId: string, userId: string) => {
      if (!supabase) return { error: { message: 'Supabase not configured' } }
      return supabase.rpc('toggle_product_like', { p_product_id: productId, p_user_id: userId })
    }
  },

  // Reels
  reels: {
    get: async (id: string) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('reels').select('*, companies(name, logo_url)').eq('id', id).single()
    },
    list: async (filters?: { company_id?: string; limit?: number; offset?: number }) => {
      if (!supabase) return { data: [], error: { message: 'Supabase not configured' } }
      let query = supabase.from('reels').select('*, companies(name, logo_url)')
      if (filters?.company_id) query = query.eq('company_id', filters.company_id)
      if (filters?.limit) query = query.limit(filters.limit)
      if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      return query.eq('is_active', true).order('created_at', { ascending: false })
    },
    create: async (data: Partial<DbReel>) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('reels').insert(data).select().single()
    },
    delete: async (id: string) => {
      if (!supabase) return { error: { message: 'Supabase not configured' } }
      return supabase.from('reels').delete().eq('id', id)
    },
    incrementViews: async (id: string) => {
      if (!supabase) return { error: { message: 'Supabase not configured' } }
      return supabase.rpc('increment_reel_views', { reel_id: id })
    }
  },

  // Wishlist
  wishlist: {
    list: async (userId: string) => {
      if (!supabase) return { data: [], error: { message: 'Supabase not configured' } }
      return supabase.from('wishlist').select('*, products(*, companies(name, logo_url))').eq('user_id', userId)
    },
    add: async (userId: string, productId: string) => {
      if (!supabase) return { error: { message: 'Supabase not configured' } }
      return supabase.from('wishlist').insert({ user_id: userId, product_id: productId })
    },
    remove: async (userId: string, productId: string) => {
      if (!supabase) return { error: { message: 'Supabase not configured' } }
      return supabase.from('wishlist').delete().eq('user_id', userId).eq('product_id', productId)
    },
    check: async (userId: string, productId: string) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('wishlist').select('id').eq('user_id', userId).eq('product_id', productId).single()
    }
  },

  // Network
  network: {
    list: async (userId: string) => {
      if (!supabase) return { data: [], error: { message: 'Supabase not configured' } }
      return supabase.from('network_connections')
        .select('*, requester:users!requester_id(*), target:users!target_id(*)')
        .or(`requester_id.eq.${userId},target_id.eq.${userId}`)
        .eq('status', 'accepted')
    },
    pending: async (userId: string) => {
      if (!supabase) return { data: [], error: { message: 'Supabase not configured' } }
      return supabase.from('network_connections')
        .select('*, requester:users!requester_id(*)')
        .eq('target_id', userId)
        .eq('status', 'pending')
    },
    connect: async (requesterId: string, targetId: string) => {
      if (!supabase) return { error: { message: 'Supabase not configured' } }
      return supabase.from('network_connections').insert({ requester_id: requesterId, target_id: targetId, status: 'pending' })
    },
    accept: async (connectionId: string) => {
      if (!supabase) return { error: { message: 'Supabase not configured' } }
      return supabase.from('network_connections').update({ status: 'accepted' }).eq('id', connectionId)
    },
    reject: async (connectionId: string) => {
      if (!supabase) return { error: { message: 'Supabase not configured' } }
      return supabase.from('network_connections').update({ status: 'rejected' }).eq('id', connectionId)
    }
  },

  // Notifications
  notifications: {
    list: async (userId: string, limit = 50) => {
      if (!supabase) return { data: [], error: { message: 'Supabase not configured' } }
      return supabase.from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
    },
    markRead: async (id: string) => {
      if (!supabase) return { error: { message: 'Supabase not configured' } }
      return supabase.from('notifications').update({ read: true }).eq('id', id)
    },
    markAllRead: async (userId: string) => {
      if (!supabase) return { error: { message: 'Supabase not configured' } }
      return supabase.from('notifications').update({ read: true }).eq('user_id', userId)
    },
    unreadCount: async (userId: string) => {
      if (!supabase) return { count: 0, error: { message: 'Supabase not configured' } }
      return supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('read', false)
    }
  },

  // Feed
  feed: {
    list: async (limit = 20, offset = 0) => {
      if (!supabase) return { data: [], error: { message: 'Supabase not configured' } }
      return supabase.from('feed_posts')
        .select('*, companies(name, logo_url)')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
    },
    create: async (data: Partial<DbFeedPost>) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('feed_posts').insert(data).select().single()
    }
  },

  // Chat
  chats: {
    list: async (userId: string) => {
      if (!supabase) return { data: [], error: { message: 'Supabase not configured' } }
      return supabase.from('chats')
        .select('*')
        .contains('participants', [userId])
        .order('last_message_at', { ascending: false })
    },
    get: async (id: string) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('chats').select('*').eq('id', id).single()
    },
    create: async (participants: string[]) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('chats').insert({ participants }).select().single()
    }
  },

  messages: {
    list: async (chatId: string, limit = 50) => {
      if (!supabase) return { data: [], error: { message: 'Supabase not configured' } }
      return supabase.from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .limit(limit)
    },
    send: async (data: Partial<DbMessage>) => {
      if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
      return supabase.from('messages').insert(data).select().single()
    }
  }
}

// Storage helpers
export const storage = {
  upload: async (bucket: string, path: string, file: File) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
    return supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true
    })
  },
  getPublicUrl: (bucket: string, path: string) => {
    if (!supabase) return null
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
  },
  delete: async (bucket: string, paths: string[]) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } }
    return supabase.storage.from(bucket).remove(paths)
  }
}

// Realtime subscriptions
export const realtime = {
  subscribeToChat: (chatId: string, callback: (message: DbMessage) => void) => {
    if (!supabase) return null
    return supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => callback(payload.new as DbMessage))
      .subscribe()
  },
  subscribeToNotifications: (userId: string, callback: (notification: DbNotification) => void) => {
    if (!supabase) return null
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => callback(payload.new as DbNotification))
      .subscribe()
  },
  unsubscribe: (channel: ReturnType<typeof supabase.channel>) => {
    if (!supabase || !channel) return
    supabase.removeChannel(channel)
  }
}
