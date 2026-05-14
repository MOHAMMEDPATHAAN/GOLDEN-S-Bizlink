// ============================================
// BIZLINK — Backblaze B2 Storage
// Developer: GOLDEN'S (Golden techS)
// Media (images/videos) are stored in B2.
// Served via Cloudflare CDN for fast delivery.
// 🟢🟢 Replace constants below 🟢🟢
// ============================================

// ─────────────────────────────────────────────
//  🟢🟢 PASTE YOUR BACKBLAZE B2 CREDENTIALS 🟢🟢
// ─────────────────────────────────────────────
const B2_BUCKET_NAME      = '🟢🟢_YOUR_B2_BUCKET_NAME_🟢🟢'
const B2_BUCKET_ID        = '🟢🟢_YOUR_B2_BUCKET_ID_🟢🟢'
const B2_APPLICATION_KEY  = '🟢🟢_YOUR_B2_APPLICATION_KEY_🟢🟢'
const B2_KEY_ID           = '🟢🟢_YOUR_B2_KEY_ID_🟢🟢'
// 🟢🟢 Set to your Cloudflare custom domain if configured 🟢🟢
// e.g. "https://media.yourdomain.com"
// If not yet configured, leave as empty string and B2 direct URL will be used.
const CF_DOMAIN           = '🟢🟢_YOUR_CLOUDFLARE_DOMAIN_OR_EMPTY_🟢🟢'
// ─────────────────────────────────────────────

export const isB2Ready = () =>
  !B2_BUCKET_NAME.includes('🟢🟢') && !B2_APPLICATION_KEY.includes('🟢🟢')

// Returns the public CDN URL for a stored file path
export function b2PublicUrl(path: string): string {
  if (!path) return ''
  // If already a full URL just return it
  if (path.startsWith('http')) return path

  // Use Cloudflare CDN if configured
  if (CF_DOMAIN && !CF_DOMAIN.includes('🟢🟢')) {
    return `${CF_DOMAIN.replace(/\/$/, '')}/${path}`
  }

  // Fall back to Backblaze public URL
  if (!B2_BUCKET_NAME.includes('🟢🟢')) {
    return `https://f005.backblazeb2.com/file/${B2_BUCKET_NAME}/${path}`
  }

  return path
}

// Upload a file to B2 via a Next.js API route (/api/upload)
// so that credentials are never exposed client-side.
export async function uploadToB2(
  file: File,
  folder: 'products' | 'reels' | 'avatars' | 'logos'
): Promise<{ url: string; path: string; error: string | null }> {
  if (!isB2Ready()) {
    // Fallback: create a local object URL so UI works without B2
    const localUrl = URL.createObjectURL(file)
    return { url: localUrl, path: localUrl, error: null }
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) {
      const txt = await res.text()
      return { url: '', path: '', error: txt || 'Upload failed' }
    }

    const { url, path } = await res.json() as { url: string; path: string }
    return { url, path, error: null }
  } catch (err) {
    return { url: '', path: '', error: (err as Error).message }
  }
}

export { B2_BUCKET_NAME, B2_BUCKET_ID, B2_APPLICATION_KEY, B2_KEY_ID, CF_DOMAIN }
