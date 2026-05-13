"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, Plus, Image as ImageIcon, Tag, DollarSign, Package, FileText, Layers, Save, Eye, Trash2 } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { db } from "@/lib/db"
import { BottomNav } from "@/components/bottom-nav"
import { AIChatFab } from "@/components/ai-chat-fab"

const CATEGORIES = [
  "Electronics",
  "Textiles",
  "Machinery",
  "Food & Beverage",
  "Chemicals",
  "Construction",
  "Automotive",
  "Healthcare",
  "Agriculture",
  "Other",
]

interface ProductFormData {
  name: string
  description: string
  category: string
  images: string[]
  minOrderQty: number
  priceMin: number
  priceMax: number
  currency: string
  specifications: Record<string, string>
  tags: string[]
}

export default function AddProductPage() {
  const router = useRouter()
  const { company } = useAppStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [newTag, setNewTag] = useState("")
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    images: [],
    minOrderQty: 1,
    priceMin: 0,
    priceMax: 0,
    currency: "USD",
    specifications: {},
    tags: [],
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({})

  const steps = [
    { number: 1, title: "Basic Info" },
    { number: 2, title: "Images" },
    { number: 3, title: "Pricing" },
    { number: 4, title: "Details" },
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, event.target!.result as string]
          }))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey.trim()]: newSpecValue.trim()
        }
      }))
      setNewSpecKey("")
      setNewSpecValue("")
    }
  }

  const removeSpecification = (key: string) => {
    setFormData(prev => {
      const { [key]: _, ...rest } = prev.specifications
      return { ...prev, specifications: rest }
    })
  }

  const validateStep = (step: number): boolean => {
    const newErrors: typeof errors = {}

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Product name is required"
      if (!formData.description.trim()) newErrors.description = "Description is required"
      if (!formData.category) newErrors.category = "Category is required"
    }

    if (step === 3) {
      if (formData.priceMin <= 0) newErrors.priceMin = "Minimum price must be greater than 0"
      if (formData.priceMax <= 0) newErrors.priceMax = "Maximum price must be greater than 0"
      if (formData.priceMax < formData.priceMin) newErrors.priceMax = "Max price must be >= min price"
      if (formData.minOrderQty < 1) newErrors.minOrderQty = "MOQ must be at least 1"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      // Mock save to database
      const product = {
        id: `product-${Date.now()}`,
        companyId: company?.id || "company-1",
        name: formData.name,
        description: formData.description,
        category: formData.category,
        images: formData.images,
        specifications: formData.specifications,
        minOrderQty: formData.minOrderQty,
        priceRange: {
          min: formData.priceMin,
          max: formData.priceMax,
          currency: formData.currency,
        },
        tags: formData.tags,
        isActive: true,
        views: 0,
        likes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Save to localStorage
      const existingProducts = JSON.parse(localStorage.getItem("bizlink_products") || "[]")
      existingProducts.push(product)
      localStorage.setItem("bizlink_products", JSON.stringify(existingProducts))

      await new Promise(r => setTimeout(r, 1000))
      router.push("/products")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b-4 border-foreground sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted transition-colors border-2 border-transparent hover:border-foreground"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Add Product</h1>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || currentStep < 4}
            className={`p-2 transition-colors ${
              currentStep === 4 ? "bg-primary border-2 border-foreground" : "opacity-50"
            }`}
          >
            <Save className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <button
                  onClick={() => step.number < currentStep && setCurrentStep(step.number)}
                  className={`flex flex-col items-center ${
                    step.number <= currentStep ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center border-2 font-bold text-sm transition-colors ${
                      step.number === currentStep
                        ? "border-primary bg-primary text-primary-foreground"
                        : step.number < currentStep
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-foreground bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.number < currentStep ? "✓" : step.number}
                  </div>
                  <span className={`text-xs mt-1 ${
                    step.number === currentStep ? "text-primary font-bold" : "text-muted-foreground"
                  }`}>
                    {step.title}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-12 h-0.5 mx-1 ${
                      step.number < currentStep ? "bg-green-500" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Form Content */}
      <div className="p-4">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="brutalist-card p-4">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Product Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                    className={`brutalist-input w-full ${errors.name ? "border-destructive" : ""}`}
                  />
                  {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Description <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your product..."
                    rows={4}
                    className={`brutalist-input w-full resize-none ${errors.description ? "border-destructive" : ""}`}
                  />
                  {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`brutalist-input w-full ${errors.category ? "border-destructive" : ""}`}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-destructive text-sm mt-1">{errors.category}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Images */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="brutalist-card p-4">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Product Images
              </h2>

              {/* Upload Area */}
              <label className="block">
                <div className="border-4 border-dashed border-foreground p-8 text-center cursor-pointer hover:bg-muted transition-colors">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="font-bold">Click to upload images</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB each</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative aspect-square border-4 border-foreground">
                      <img src={image} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-xs text-center py-1 font-bold">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-muted-foreground mt-3">
                First image will be used as the main product image
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="brutalist-card p-4">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Pricing & Quantity
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="brutalist-input w-full"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Min Price <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.priceMin || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, priceMin: Number(e.target.value) }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`brutalist-input w-full ${errors.priceMin ? "border-destructive" : ""}`}
                    />
                    {errors.priceMin && <p className="text-destructive text-xs mt-1">{errors.priceMin}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Max Price <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.priceMax || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, priceMax: Number(e.target.value) }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`brutalist-input w-full ${errors.priceMax ? "border-destructive" : ""}`}
                    />
                    {errors.priceMax && <p className="text-destructive text-xs mt-1">{errors.priceMax}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Minimum Order Quantity (MOQ) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderQty || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, minOrderQty: Number(e.target.value) }))}
                    placeholder="1"
                    min="1"
                    className={`brutalist-input w-full ${errors.minOrderQty ? "border-destructive" : ""}`}
                  />
                  {errors.minOrderQty && <p className="text-destructive text-sm mt-1">{errors.minOrderQty}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Details */}
        {currentStep === 4 && (
          <div className="space-y-4">
            {/* Specifications */}
            <div className="brutalist-card p-4">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Specifications
              </h2>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    placeholder="Property"
                    className="brutalist-input flex-1"
                  />
                  <input
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    placeholder="Value"
                    className="brutalist-input flex-1"
                  />
                  <button
                    onClick={addSpecification}
                    className="brutalist-btn px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {Object.entries(formData.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 border-2 border-foreground bg-muted">
                    <span>
                      <strong>{key}:</strong> {value}
                    </span>
                    <button
                      onClick={() => removeSpecification(key)}
                      className="p-1 hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="brutalist-card p-4">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Tags
              </h2>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add a tag"
                  className="brutalist-input flex-1"
                />
                <button onClick={addTag} className="brutalist-btn px-4">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 border-2 border-primary text-sm"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="brutalist-card p-4">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Preview
              </h2>

              <div className="border-4 border-foreground p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-muted flex items-center justify-center border-2 border-foreground flex-shrink-0">
                    {formData.images[0] ? (
                      <img src={formData.images[0]} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{formData.name || "Product Name"}</h3>
                    <p className="text-sm text-muted-foreground">{formData.category || "Category"}</p>
                    <p className="text-sm font-bold text-primary mt-1">
                      {formData.currency} {formData.priceMin || 0} - {formData.priceMax || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">MOQ: {formData.minOrderQty} units</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t-4 border-foreground">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 brutalist-btn bg-muted text-foreground"
            >
              Back
            </button>
          )}
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="flex-1 brutalist-btn"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 brutalist-btn"
            >
              {isSubmitting ? "Saving..." : "Publish Product"}
            </button>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav userType="company" />

      {/* AI Chat FAB */}
      <AIChatFab />
    </div>
  )
}
