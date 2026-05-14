// ============================================
// BIZLINK — Supabase Client
// Developer: GOLDEN'S (Golden techS)
// 🟢🟢 Replace the two constants below 🟢🟢
// ============================================
import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────
//  🟢🟢 PASTE YOUR SUPABASE CREDENTIALS HERE 🟢🟢
// ─────────────────────────────────────────────
const SUPABASE_URL  = '🟢🟢_YOUR_SUPABASE_URL_🟢🟢'
const SUPABASE_ANON = '🟢🟢_YOUR_SUPABASE_ANON_KEY_🟢🟢'
// ─────────────────────────────────────────────

export const isSupabaseReady = () =>
  !SUPABASE_URL.includes('🟢🟢') && !SUPABASE_ANON.includes('🟢🟢')

export const supabase = isSupabaseReady()
  ? createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'bizlink-auth',
      },
    })
  : null

// ─── helpers re-exported for convenience ─────
export { SUPABASE_URL }
