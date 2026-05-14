import { NextRequest, NextResponse } from "next/server"

// ─── Backblaze B2 credentials (server-side only) ────────────────────
// Set these as environment variables in Vercel / .env.local:
//   B2_KEY_ID
//   B2_APPLICATION_KEY
//   B2_BUCKET_ID
//   B2_BUCKET_NAME
//   CF_DOMAIN  (optional — your Cloudflare custom domain)

const B2_KEY_ID          = process.env.B2_KEY_ID ?? ""
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY ?? ""
const B2_BUCKET_ID       = process.env.B2_BUCKET_ID ?? ""
const B2_BUCKET_NAME     = process.env.B2_BUCKET_NAME ?? ""
const CF_DOMAIN          = process.env.CF_DOMAIN ?? ""

interface B2AuthResponse {
  authorizationToken: string
  apiUrl: string
  downloadUrl: string
  recommendedPartSize: number
}

interface B2UploadUrlResponse {
  uploadUrl: string
  authorizationToken: string
}

async function authorizeB2(): Promise<B2AuthResponse> {
  const credentials = Buffer.from(`${B2_KEY_ID}:${B2_APPLICATION_KEY}`).toString("base64")
  const res = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    headers: { Authorization: `Basic ${credentials}` },
  })
  if (!res.ok) throw new Error(`B2 auth failed: ${await res.text()}`)
  return res.json()
}

async function getUploadUrl(apiUrl: string, authToken: string): Promise<B2UploadUrlResponse> {
  const res = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: "POST",
    headers: { Authorization: authToken, "Content-Type": "application/json" },
    body: JSON.stringify({ bucketId: B2_BUCKET_ID }),
  })
  if (!res.ok) throw new Error(`B2 getUploadUrl failed: ${await res.text()}`)
  return res.json()
}

export async function POST(req: NextRequest) {
  // Check config
  if (!B2_KEY_ID || !B2_APPLICATION_KEY || !B2_BUCKET_ID || !B2_BUCKET_NAME) {
    return NextResponse.json({ error: "B2 credentials not configured. Set B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_ID, B2_BUCKET_NAME in env vars." }, { status: 503 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  const folder = (formData.get("folder") as string) || "uploads"

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  // File size limit: 500 MB
  const MAX = 500 * 1024 * 1024
  if (file.size > MAX) return NextResponse.json({ error: "File too large (max 500 MB)" }, { status: 413 })

  try {
    // 1. Authorise
    const auth = await authorizeB2()

    // 2. Get upload URL
    const uploadInfo = await getUploadUrl(auth.apiUrl, auth.authorizationToken)

    // 3. Build unique path
    const ext = file.name.split(".").pop() ?? "bin"
    const ts = Date.now()
    const rand = Math.random().toString(36).slice(2, 8)
    const path = `${folder}/${ts}-${rand}.${ext}`

    // 4. SHA-1 hash (required by B2)
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-1", buffer)
    const sha1 = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")

    // 5. Upload
    const uploadRes = await fetch(uploadInfo.uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uploadInfo.authorizationToken,
        "X-Bz-File-Name": encodeURIComponent(path),
        "Content-Type": file.type || "application/octet-stream",
        "Content-Length": String(file.size),
        "X-Bz-Content-Sha1": sha1,
      },
      body: buffer,
    })

    if (!uploadRes.ok) {
      const txt = await uploadRes.text()
      return NextResponse.json({ error: `B2 upload failed: ${txt}` }, { status: 502 })
    }

    // 6. Build public URL
    let url: string
    if (CF_DOMAIN) {
      url = `${CF_DOMAIN.replace(/\/$/, "")}/${path}`
    } else {
      url = `https://f005.backblazeb2.com/file/${B2_BUCKET_NAME}/${path}`
    }

    return NextResponse.json({ url, path })
  } catch (err) {
    console.error("[B2 upload]", err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
