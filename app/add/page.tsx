"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, Plus, Image as ImageIcon, Tag, DollarSign, FileText, Layers, Save, Trash2, Play, Package, Film } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import { products, reels, auth, companies } from "@/lib/db"
import { BottomNav } from "@/components/bottom-nav"

const CATEGORIES = ["Electronics", "Textiles", "Machinery", "Food & Beverage", "Chemicals", "Construction", "Automotive", "Healthcare", "Agriculture", "Other"]

type AddMode = "product" | "reel"

export default function AddPage() {
  const router = useRouter()
  const { user, setUser, company, setCompany, selectedRole } = useAppStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mode, setMode] = useState<AddMode>("product")
  const [step, setStep] = useState(1)
  const [success, setSuccess] = useState(false)

  // Product form
  const [productForm, setProductForm] = useState({
    name: "", description: "", category: "", images: [] as string[], minOrderQty: 1,
    priceMin: 0, priceMax: 0, currency: "USD", specifications: {} as Record<string, string>, tags: [] as string[]
  })
  const [newTag, setNewTag] = useState("")
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reel form
  const [reelForm, setReelForm] = useState({ title: "", description: "", videoUrl: "", thumbnailUrl: "", tags: [] as string[], productsTagged: [] as string[] })
  const [reelTag, setReelTag] = useState("")

  useEffect(() => {
    const init = async () => {
      const { user: sessionUser } = await auth.getSession()
      if (!sessionUser) { router.push('/auth'); return }
      setUser(sessionUser)
      const comp = await companies.getByOwner(sessionUser.id)
      if (comp) setCompany(comp)
    }
    init()
  }, [router, setUser, setCompany])

  const steps = mode === "product" 
    ? [{ n: 1, t: "Info" }, { n: 2, t: "Images" }, { n: 3, t: "Pricing" }, { n: 4, t: "Details" }]
    : [{ n: 1, t: "Video" }, { n: 2, t: "Details" }]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => { if (ev.target?.result) setProductForm(p => ({ ...p, images: [...p.images, ev.target!.result as string] })) }
      reader.readAsDataURL(file)
    })
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { if (ev.target?.result) setReelForm(p => ({ ...p, videoUrl: ev.target!.result as string })) }
    reader.readAsDataURL(file)
  }

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { if (ev.target?.result) setReelForm(p => ({ ...p, thumbnailUrl: ev.target!.result as string })) }
    reader.readAsDataURL(file)
  }

  const addTag = (isReel = false) => {
    if (isReel && reelTag.trim()) {
      if (!reelForm.tags.includes(reelTag.trim())) setReelForm(p => ({ ...p, tags: [...p.tags, reelTag.trim()] }))
      setReelTag("")
    } else if (newTag.trim() && !productForm.tags.includes(newTag.trim())) {
      setProductForm(p => ({ ...p, tags: [...p.tags, newTag.trim()] }))
      setNewTag("")
    }
  }

  const addSpec = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setProductForm(p => ({ ...p, specifications: { ...p.specifications, [newSpecKey.trim()]: newSpecValue.trim() } }))
      setNewSpecKey(""); setNewSpecValue("")
    }
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (mode === "product") {
      if (step === 1) {
        if (!productForm.name.trim()) errs.name = "Required"
        if (!productForm.description.trim()) errs.description = "Required"
        if (!productForm.category) errs.category = "Required"
      }
      if (step === 3) {
        if (productForm.priceMin <= 0) errs.priceMin = "Must be > 0"
        if (productForm.priceMax <= 0) errs.priceMax = "Must be > 0"
        if (productForm.priceMax < productForm.priceMin) errs.priceMax = "Must be >= min"
      }
    } else {
      if (step === 1 && !reelForm.videoUrl) errs.video = "Video required"
      if (step === 2 && !reelForm.title.trim()) errs.title = "Required"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, steps.length)) }
  const back = () => setStep(s => Math.max(s - 1, 1))

  const submit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    try {
      if (mode === "product") {
        await products.create({
          company_id: company?.id || 'demo',
          name: productForm.name,
          description: productForm.description,
          category: productForm.category,
          images: productForm.images,
          specifications: productForm.specifications,
          tags: productForm.tags,
        })
      } else {
        await reels.create({
          company_id: company?.id || 'demo',
          user_id: user?.id || 'demo',
          title: reelForm.title,
          description: reelForm.description,
          video_url: reelForm.videoUrl,
          thumbnail_url: reelForm.thumbnailUrl,
          tags: reelForm.tags,
          products_tagged: reelForm.productsTagged,
          duration: 30,
        })
      }
      setSuccess(true)
      setTimeout(() => router.push(mode === "product" ? "/products" : "/reels"), 1500)
    } finally { setIsSubmitting(false) }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="brutalist-card p-6 text-center max-w-sm w-full animate-in zoom-in duration-300">
          <div className="w-14 h-14 mx-auto mb-4 bg-green-500 text-white flex items-center justify-center border-4 border-foreground">
            <Save className="w-7 h-7" />
          </div>
          <h2 className="font-bold text-lg mb-1">{mode === "product" ? "Product" : "Reel"} Added!</h2>
          <p className="text-muted-foreground text-sm">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b-4 border-foreground sticky top-0 z-40">
        <div className="flex items-center justify-between p-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted border-2 border-transparent hover:border-foreground active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold">Add {mode === "product" ? "Product" : "Reel"}</h1>
          <button onClick={submit} disabled={isSubmitting || step < steps.length} className={cn("p-2 border-2 border-foreground transition-all active:scale-95", step === steps.length ? "bg-primary text-primary-foreground" : "opacity-40")}>
            <Save className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-3 pb-3 flex gap-2">
          <button onClick={() => { setMode("product"); setStep(1) }} className={cn("flex-1 py-2 px-3 text-sm font-bold border-2 border-foreground flex items-center justify-center gap-2 active:scale-98 transition-all", mode === "product" ? "bg-primary text-primary-foreground" : "bg-muted")}>
            <Package className="w-4 h-4" /> Product
          </button>
          <button onClick={() => { setMode("reel"); setStep(1) }} className={cn("flex-1 py-2 px-3 text-sm font-bold border-2 border-foreground flex items-center justify-center gap-2 active:scale-98 transition-all", mode === "reel" ? "bg-primary text-primary-foreground" : "bg-muted")}>
            <Film className="w-4 h-4" /> Reel
          </button>
        </div>

        {/* Steps */}
        <div className="px-3 pb-3 flex items-center justify-center gap-1">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center">
              <button onClick={() => s.n < step && setStep(s.n)} className={cn("flex flex-col items-center", s.n <= step ? "cursor-pointer" : "cursor-not-allowed")}>
                <div className={cn("w-7 h-7 flex items-center justify-center border-2 font-bold text-xs", s.n === step ? "border-primary bg-primary text-primary-foreground" : s.n < step ? "border-green-500 bg-green-500 text-white" : "border-muted bg-muted text-muted-foreground")}>
                  {s.n < step ? "✓" : s.n}
                </div>
                <span className={cn("text-[10px] mt-0.5", s.n === step ? "text-primary font-bold" : "text-muted-foreground")}>{s.t}</span>
              </button>
              {i < steps.length - 1 && <div className={cn("w-6 h-0.5 mx-1", s.n < step ? "bg-green-500" : "bg-muted")} />}
            </div>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="p-3">
        {mode === "product" ? (
          <>
            {/* Product Step 1: Info */}
            {step === 1 && (
              <div className="brutalist-card p-3 space-y-3">
                <h2 className="font-bold flex items-center gap-2 text-sm"><FileText className="w-4 h-4 text-primary" /> Basic Info</h2>
                <div>
                  <label className="block text-xs font-bold mb-1">Name <span className="text-destructive">*</span></label>
                  <input type="text" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} placeholder="Product name" className={cn("brutalist-input w-full py-2 text-sm", errors.name && "border-destructive")} />
                  {errors.name && <p className="text-destructive text-xs mt-0.5">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Description <span className="text-destructive">*</span></label>
                  <textarea value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe your product..." rows={3} className={cn("brutalist-input w-full py-2 text-sm resize-none", errors.description && "border-destructive")} />
                  {errors.description && <p className="text-destructive text-xs mt-0.5">{errors.description}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Category <span className="text-destructive">*</span></label>
                  <select value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))} className={cn("brutalist-input w-full py-2 text-sm", errors.category && "border-destructive")}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-destructive text-xs mt-0.5">{errors.category}</p>}
                </div>
              </div>
            )}

            {/* Product Step 2: Images */}
            {step === 2 && (
              <div className="brutalist-card p-3 space-y-3">
                <h2 className="font-bold flex items-center gap-2 text-sm"><ImageIcon className="w-4 h-4 text-primary" /> Images</h2>
                <label className="block border-2 border-dashed border-foreground p-6 text-center cursor-pointer hover:bg-muted transition-colors active:scale-98">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-1" />
                  <p className="font-bold text-sm">Upload Images</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
                {productForm.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {productForm.images.map((img, i) => (
                      <div key={i} className="relative aspect-square border-2 border-foreground">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setProductForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))} className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white flex items-center justify-center active:scale-95">
                          <X className="w-3 h-3" />
                        </button>
                        {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[10px] text-center py-0.5 font-bold">Main</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Product Step 3: Pricing */}
            {step === 3 && (
              <div className="brutalist-card p-3 space-y-3">
                <h2 className="font-bold flex items-center gap-2 text-sm"><DollarSign className="w-4 h-4 text-primary" /> Pricing</h2>
                <div>
                  <label className="block text-xs font-bold mb-1">Currency</label>
                  <select value={productForm.currency} onChange={e => setProductForm(p => ({ ...p, currency: e.target.value }))} className="brutalist-input w-full py-2 text-sm">
                    <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="AED">AED</option><option value="INR">INR</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold mb-1">Min Price <span className="text-destructive">*</span></label>
                    <input type="number" value={productForm.priceMin || ""} onChange={e => setProductForm(p => ({ ...p, priceMin: Number(e.target.value) }))} placeholder="0" min="0" className={cn("brutalist-input w-full py-2 text-sm", errors.priceMin && "border-destructive")} />
                    {errors.priceMin && <p className="text-destructive text-[10px] mt-0.5">{errors.priceMin}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Max Price <span className="text-destructive">*</span></label>
                    <input type="number" value={productForm.priceMax || ""} onChange={e => setProductForm(p => ({ ...p, priceMax: Number(e.target.value) }))} placeholder="0" min="0" className={cn("brutalist-input w-full py-2 text-sm", errors.priceMax && "border-destructive")} />
                    {errors.priceMax && <p className="text-destructive text-[10px] mt-0.5">{errors.priceMax}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">MOQ</label>
                  <input type="number" value={productForm.minOrderQty} onChange={e => setProductForm(p => ({ ...p, minOrderQty: Number(e.target.value) }))} min="1" className="brutalist-input w-full py-2 text-sm" />
                </div>
              </div>
            )}

            {/* Product Step 4: Details */}
            {step === 4 && (
              <div className="space-y-3">
                <div className="brutalist-card p-3 space-y-2">
                  <h2 className="font-bold flex items-center gap-2 text-sm"><Layers className="w-4 h-4 text-primary" /> Specs</h2>
                  <div className="flex gap-1">
                    <input type="text" value={newSpecKey} onChange={e => setNewSpecKey(e.target.value)} placeholder="Property" className="brutalist-input flex-1 py-1.5 text-sm" />
                    <input type="text" value={newSpecValue} onChange={e => setNewSpecValue(e.target.value)} placeholder="Value" className="brutalist-input flex-1 py-1.5 text-sm" />
                    <button onClick={addSpec} className="brutalist-btn px-3 py-1.5"><Plus className="w-4 h-4" /></button>
                  </div>
                  {Object.entries(productForm.specifications).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between p-1.5 border-2 border-foreground bg-muted text-sm">
                      <span><strong>{k}:</strong> {v}</span>
                      <button onClick={() => setProductForm(p => { const { [k]: _, ...rest } = p.specifications; return { ...p, specifications: rest } })} className="p-1 text-destructive active:scale-95"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                <div className="brutalist-card p-3 space-y-2">
                  <h2 className="font-bold flex items-center gap-2 text-sm"><Tag className="w-4 h-4 text-primary" /> Tags</h2>
                  <div className="flex gap-1">
                    <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add tag" className="brutalist-input flex-1 py-1.5 text-sm" />
                    <button onClick={() => addTag()} className="brutalist-btn px-3 py-1.5"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {productForm.tags.map(t => (
                      <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 border-2 border-primary text-xs font-bold">
                        #{t} <button onClick={() => setProductForm(p => ({ ...p, tags: p.tags.filter(x => x !== t) }))} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Reel Step 1: Video */}
            {step === 1 && (
              <div className="brutalist-card p-3 space-y-3">
                <h2 className="font-bold flex items-center gap-2 text-sm"><Play className="w-4 h-4 text-primary" /> Upload Video</h2>
                {!reelForm.videoUrl ? (
                  <label className="block border-2 border-dashed border-foreground p-8 text-center cursor-pointer hover:bg-muted transition-colors active:scale-98">
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="font-bold text-sm">Select Video</p>
                    <p className="text-xs text-muted-foreground">MP4, MOV up to 100MB</p>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  </label>
                ) : (
                  <div className="relative aspect-[9/16] max-h-[50vh] bg-black border-2 border-foreground overflow-hidden mx-auto">
                    <video src={reelForm.videoUrl} className="w-full h-full object-contain" controls />
                    <button onClick={() => setReelForm(p => ({ ...p, videoUrl: "" }))} className="absolute top-2 right-2 w-8 h-8 bg-destructive text-white flex items-center justify-center active:scale-95">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {errors.video && <p className="text-destructive text-xs">{errors.video}</p>}

                <div>
                  <label className="block text-xs font-bold mb-1">Thumbnail (optional)</label>
                  {!reelForm.thumbnailUrl ? (
                    <label className="block border-2 border-dashed border-foreground p-4 text-center cursor-pointer hover:bg-muted transition-colors active:scale-98">
                      <ImageIcon className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xs">Add custom thumbnail</p>
                      <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                    </label>
                  ) : (
                    <div className="relative w-24 h-32 border-2 border-foreground">
                      <img src={reelForm.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setReelForm(p => ({ ...p, thumbnailUrl: "" }))} className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white flex items-center justify-center active:scale-95">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reel Step 2: Details */}
            {step === 2 && (
              <div className="brutalist-card p-3 space-y-3">
                <h2 className="font-bold flex items-center gap-2 text-sm"><FileText className="w-4 h-4 text-primary" /> Details</h2>
                <div>
                  <label className="block text-xs font-bold mb-1">Title <span className="text-destructive">*</span></label>
                  <input type="text" value={reelForm.title} onChange={e => setReelForm(p => ({ ...p, title: e.target.value }))} placeholder="Reel title" className={cn("brutalist-input w-full py-2 text-sm", errors.title && "border-destructive")} />
                  {errors.title && <p className="text-destructive text-xs mt-0.5">{errors.title}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Description</label>
                  <textarea value={reelForm.description} onChange={e => setReelForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe your reel..." rows={3} className="brutalist-input w-full py-2 text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Tags</label>
                  <div className="flex gap-1">
                    <input type="text" value={reelTag} onChange={e => setReelTag(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag(true))} placeholder="Add tag" className="brutalist-input flex-1 py-1.5 text-sm" />
                    <button onClick={() => addTag(true)} className="brutalist-btn px-3 py-1.5"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {reelForm.tags.map(t => (
                      <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 border-2 border-primary text-xs font-bold">
                        #{t} <button onClick={() => setReelForm(p => ({ ...p, tags: p.tags.filter(x => x !== t) }))} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-2 mt-4">
          {step > 1 && (
            <button onClick={back} className="brutalist-btn flex-1 py-2.5 text-sm active:scale-98 transition-transform">
              Back
            </button>
          )}
          {step < steps.length ? (
            <button onClick={next} className="brutalist-btn bg-primary text-primary-foreground flex-1 py-2.5 text-sm active:scale-98 transition-transform">
              Next
            </button>
          ) : (
            <button onClick={submit} disabled={isSubmitting} className="brutalist-btn bg-primary text-primary-foreground flex-1 py-2.5 text-sm active:scale-98 transition-transform flex items-center justify-center gap-2">
              {isSubmitting ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {isSubmitting ? "Saving..." : `Save ${mode === "product" ? "Product" : "Reel"}`}
            </button>
          )}
        </div>
      </div>

      <BottomNav variant={selectedRole === 'salesman' || selectedRole === 'viewer' ? 'salesman' : 'company'} />
    </div>
  )
}
