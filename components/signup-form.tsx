'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StepIndicator } from '@/components/step-indicator'
import { PasswordInput } from '@/components/password-input'
import { ImageUpload } from '@/components/image-upload'
import { useAppStore } from '@/lib/store'
import { auth, companies, draftSignup } from '@/lib/db'
import {
  PRODUCTION_TYPES,
  INDUSTRY_CATEGORIES,
  LEGAL_ENTITY_TYPES,
  COUNTRIES,
  CURRENCIES,
  DAYS_OF_WEEK,
  type Currency,
  type OperatingHours,
  type SocialLinks,
} from '@/lib/types'

interface SignUpFormProps {
  onBack: () => void
  onComplete: () => void
}

const STEPS = [
  { id: 1, title: 'Account' },
  { id: 2, title: 'Company' },
  { id: 3, title: 'Details' },
  { id: 4, title: 'Finish' },
]

export function SignUpForm({ onBack, onComplete }: SignUpFormProps) {
  const { selectedRole, setUser, setCompany } = useAppStore()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Step 1: Account
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  
  // Step 2: Company Basic
  const [companyName, setCompanyName] = useState('')
  const [ceoName, setCeoName] = useState('')
  const [companyProfile, setCompanyProfile] = useState('')
  const [ceoImage, setCeoImage] = useState<string | null>(null)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  
  // Step 3: Company Details
  const [country, setCountry] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [productionTypes, setProductionTypes] = useState<string[]>([])
  const [employeeCount, setEmployeeCount] = useState('')
  const [industryCategory, setIndustryCategory] = useState('')
  const [yearEstablished, setYearEstablished] = useState('')
  const [legalEntityType, setLegalEntityType] = useState('')
  const [preferredCurrency, setPreferredCurrency] = useState<Currency>('USD')
  const [website, setWebsite] = useState('')
  
  // Step 4: Additional & Consent
  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>(
    DAYS_OF_WEEK.map(day => ({ day, open: '09:00', close: '17:00', is_closed: day === 'Sunday' }))
  )
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({})
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptMarketing, setAcceptMarketing] = useState(false)

  // Save draft
  const saveDraft = () => {
    draftSignup.save({
      email, phone, companyName, ceoName, companyProfile,
      ceoImage, companyLogo, country, address, city, state, postalCode,
      productionTypes, employeeCount, industryCategory, yearEstablished,
      legalEntityType, preferredCurrency, website, operatingHours, socialLinks,
    })
  }

  // Validate step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!email) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format'
      if (!password) newErrors.password = 'Password is required'
      else if (password.length < 12) newErrors.password = 'Password must be at least 12 characters'
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
      if (!phone) newErrors.phone = 'Phone is required'
    }

    if (step === 2) {
      if (!companyName) newErrors.companyName = 'Company name is required'
      if (!ceoName) newErrors.ceoName = 'CEO name is required'
      if (!companyProfile) newErrors.companyProfile = 'Company profile is required'
      if (!ceoImage) newErrors.ceoImage = 'CEO image is required'
    }

    if (step === 3) {
      if (!country) newErrors.country = 'Country is required'
      if (!address) newErrors.address = 'Address is required'
      if (!city) newErrors.city = 'City is required'
      if (productionTypes.length === 0) newErrors.productionTypes = 'Select at least one production type'
      if (!industryCategory) newErrors.industryCategory = 'Industry category is required'
    }

    if (step === 4) {
      if (!acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      saveDraft()
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  // Handle previous step
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      onBack()
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // Create user account
      const { user, error: authError } = await auth.signUp(email, password, selectedRole || 'company_owner')
      
      if (authError) {
        setErrors({ submit: authError })
        setIsLoading(false)
        return
      }

      if (user) {
        // Create company
        const { company, error: companyError } = await companies.create({
          owner_id: user.id,
          name: companyName,
          ceo_name: ceoName,
          ceo_image: ceoImage || undefined,
          profile: companyProfile,
          logo: companyLogo || undefined,
          address: {
            street: address,
            city,
            state,
            postal_code: postalCode,
            country,
          },
          production_types: productionTypes,
          employee_count: parseInt(employeeCount) || 0,
          country,
          phone,
          email,
          website: website || undefined,
          industry_category: industryCategory,
          year_established: parseInt(yearEstablished) || new Date().getFullYear(),
          primary_language: 'en',
          preferred_currency: preferredCurrency,
          legal_entity_type: legalEntityType,
          tax_id_verified: false,
          tax_exempt: false,
          operating_hours: operatingHours,
          social_links: socialLinks,
          accept_marketing: acceptMarketing,
          subscription_plan: 'free',
        })

        if (companyError) {
          setErrors({ submit: companyError })
          setIsLoading(false)
          return
        }

        // Clear draft
        draftSignup.clear()

        // Set state
        setUser(user)
        if (company) setCompany(company)

        // Complete
        onComplete()
      }
    } catch {
      setErrors({ submit: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle production type
  const toggleProductionType = (type: string) => {
    if (productionTypes.includes(type)) {
      setProductionTypes(productionTypes.filter(t => t !== type))
    } else {
      setProductionTypes([...productionTypes, type])
    }
  }

  // Update operating hours
  const updateOperatingHours = (index: number, field: keyof OperatingHours, value: string | boolean) => {
    const updated = [...operatingHours]
    updated[index] = { ...updated[index], [field]: value }
    setOperatingHours(updated)
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Create Your Account</h2>
              <p className="text-muted-foreground mt-1">Enter your account credentials</p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold uppercase tracking-wide">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={cn('brutalist-input w-full', errors.email && 'border-destructive')}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-bold uppercase tracking-wide">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={cn('brutalist-input w-full', errors.phone && 'border-destructive')}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold uppercase tracking-wide">
                Password <span className="text-destructive">*</span>
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={setPassword}
                placeholder="Min. 12 characters"
                showStrengthMeter
                error={errors.password}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="block text-sm font-bold uppercase tracking-wide">
                Confirm Password <span className="text-destructive">*</span>
              </label>
              <PasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter password"
                error={errors.confirmPassword}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Company Information</h2>
              <p className="text-muted-foreground mt-1">Tell us about your company</p>
            </div>

            {/* CEO Image */}
            <ImageUpload
              value={ceoImage}
              onChange={(_, preview) => setCeoImage(preview)}
              type="face"
              label="CEO Photo"
              error={errors.ceoImage}
            />

            {/* Company Name */}
            <div className="space-y-2">
              <label htmlFor="company-name" className="block text-sm font-bold uppercase tracking-wide">
                Company Name <span className="text-destructive">*</span>
              </label>
              <input
                id="company-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                className={cn('brutalist-input w-full', errors.companyName && 'border-destructive')}
              />
              {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
            </div>

            {/* CEO Name */}
            <div className="space-y-2">
              <label htmlFor="ceo-name" className="block text-sm font-bold uppercase tracking-wide">
                CEO / Owner Name <span className="text-destructive">*</span>
              </label>
              <input
                id="ceo-name"
                type="text"
                value={ceoName}
                onChange={(e) => setCeoName(e.target.value)}
                placeholder="Enter CEO name"
                className={cn('brutalist-input w-full', errors.ceoName && 'border-destructive')}
              />
              {errors.ceoName && <p className="text-sm text-destructive">{errors.ceoName}</p>}
            </div>

            {/* Company Logo */}
            <ImageUpload
              value={companyLogo}
              onChange={(_, preview) => setCompanyLogo(preview)}
              type="logo"
              label="Company Logo"
            />

            {/* Company Profile */}
            <div className="space-y-2">
              <label htmlFor="company-profile" className="block text-sm font-bold uppercase tracking-wide">
                Company Profile <span className="text-destructive">*</span>
              </label>
              <textarea
                id="company-profile"
                value={companyProfile}
                onChange={(e) => setCompanyProfile(e.target.value)}
                placeholder="Describe your company, products, and services..."
                rows={4}
                className={cn('brutalist-input w-full resize-none', errors.companyProfile && 'border-destructive')}
              />
              {errors.companyProfile && <p className="text-sm text-destructive">{errors.companyProfile}</p>}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Business Details</h2>
              <p className="text-muted-foreground mt-1">Location and business information</p>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label htmlFor="country" className="block text-sm font-bold uppercase tracking-wide">
                Country <span className="text-destructive">*</span>
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={cn('brutalist-input w-full', errors.country && 'border-destructive')}
              >
                <option value="">Select country</option>
                {COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-bold uppercase tracking-wide">
                Street Address <span className="text-destructive">*</span>
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter street address"
                className={cn('brutalist-input w-full', errors.address && 'border-destructive')}
              />
              {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="city" className="block text-sm font-bold uppercase tracking-wide">
                  City <span className="text-destructive">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className={cn('brutalist-input w-full', errors.city && 'border-destructive')}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="state" className="block text-sm font-bold uppercase tracking-wide">
                  State/Province
                </label>
                <input
                  id="state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="brutalist-input w-full"
                />
              </div>
            </div>

            {/* Postal Code & Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="postal" className="block text-sm font-bold uppercase tracking-wide">
                  Postal Code
                </label>
                <input
                  id="postal"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Postal code"
                  className="brutalist-input w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="currency" className="block text-sm font-bold uppercase tracking-wide">
                  Currency
                </label>
                <select
                  id="currency"
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value as Currency)}
                  className="brutalist-input w-full"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Industry Category */}
            <div className="space-y-2">
              <label htmlFor="industry" className="block text-sm font-bold uppercase tracking-wide">
                Industry Category <span className="text-destructive">*</span>
              </label>
              <select
                id="industry"
                value={industryCategory}
                onChange={(e) => setIndustryCategory(e.target.value)}
                className={cn('brutalist-input w-full', errors.industryCategory && 'border-destructive')}
              >
                <option value="">Select industry</option>
                {INDUSTRY_CATEGORIES.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              {errors.industryCategory && <p className="text-sm text-destructive">{errors.industryCategory}</p>}
            </div>

            {/* Production Types */}
            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase tracking-wide">
                Production Types <span className="text-destructive">*</span>
              </label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border-4 border-foreground">
                {PRODUCTION_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleProductionType(type)}
                    className={cn(
                      'px-3 py-1 text-sm font-bold border-2 transition-all',
                      productionTypes.includes(type)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-foreground hover:bg-accent'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.productionTypes && <p className="text-sm text-destructive">{errors.productionTypes}</p>}
            </div>

            {/* Year & Employees */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="year" className="block text-sm font-bold uppercase tracking-wide">
                  Year Established
                </label>
                <input
                  id="year"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={yearEstablished}
                  onChange={(e) => setYearEstablished(e.target.value)}
                  placeholder="e.g., 2010"
                  className="brutalist-input w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="employees" className="block text-sm font-bold uppercase tracking-wide">
                  Employees
                </label>
                <input
                  id="employees"
                  type="number"
                  min="1"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(e.target.value)}
                  placeholder="Number"
                  className="brutalist-input w-full"
                />
              </div>
            </div>

            {/* Legal Entity Type */}
            <div className="space-y-2">
              <label htmlFor="legal-entity" className="block text-sm font-bold uppercase tracking-wide">
                Legal Entity Type
              </label>
              <select
                id="legal-entity"
                value={legalEntityType}
                onChange={(e) => setLegalEntityType(e.target.value)}
                className="brutalist-input w-full"
              >
                <option value="">Select type</option>
                {LEGAL_ENTITY_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <label htmlFor="website" className="block text-sm font-bold uppercase tracking-wide">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="brutalist-input w-full"
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Final Steps</h2>
              <p className="text-muted-foreground mt-1">Operating hours and consent</p>
            </div>

            {/* Operating Hours */}
            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase tracking-wide">
                Operating Hours
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border-4 border-foreground p-3">
                {operatingHours.map((hours, index) => (
                  <div key={hours.day} className="flex items-center gap-2 text-sm">
                    <span className="w-20 font-medium">{hours.day.slice(0, 3)}</span>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={!hours.is_closed}
                        onChange={(e) => updateOperatingHours(index, 'is_closed', !e.target.checked)}
                        className="w-4 h-4 border-2 border-foreground"
                      />
                      <span className="text-xs">Open</span>
                    </label>
                    {!hours.is_closed && (
                      <>
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => updateOperatingHours(index, 'open', e.target.value)}
                          className="brutalist-input px-2 py-1 text-xs"
                        />
                        <span>-</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => updateOperatingHours(index, 'close', e.target.value)}
                          className="brutalist-input px-2 py-1 text-xs"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase tracking-wide">
                Social Media Links
              </label>
              <div className="space-y-2">
                {['linkedin', 'twitter', 'instagram', 'youtube', 'whatsapp'].map(platform => (
                  <input
                    key={platform}
                    type="url"
                    value={socialLinks[platform as keyof SocialLinks] || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, [platform]: e.target.value })}
                    placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                    className="brutalist-input w-full text-sm"
                  />
                ))}
              </div>
            </div>

            {/* Consent */}
            <div className="space-y-4 pt-4 border-t-4 border-foreground">
              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-5 h-5 mt-0.5 border-4 border-foreground"
                />
                <span className="text-sm">
                  I agree to the{' '}
                  <a href="/terms" className="text-primary font-bold hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</a>
                  {' '}<span className="text-destructive">*</span>
                </span>
              </label>
              {errors.acceptTerms && <p className="text-sm text-destructive">{errors.acceptTerms}</p>}

              {/* Marketing */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptMarketing}
                  onChange={(e) => setAcceptMarketing(e.target.checked)}
                  className="w-5 h-5 mt-0.5 border-4 border-foreground"
                />
                <span className="text-sm">
                  I want to receive marketing emails and updates
                </span>
              </label>
            </div>

            {/* Error */}
            {errors.submit && (
              <div className="p-3 border-4 border-destructive bg-destructive/10 text-destructive font-medium">
                {errors.submit}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 border-b-4 border-foreground">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={handlePrev}
            className="p-2 border-4 border-foreground hover:bg-accent transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black">
              <span className="golden-text">GOLDEN&apos;S</span>{' '}
              <span className="text-foreground">BIZLINK</span>
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Create Account
            </p>
          </div>
          <button
            onClick={saveDraft}
            className="text-xs font-bold text-primary hover:underline"
          >
            Save Draft
          </button>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="p-4 border-b-4 border-foreground bg-card">
        <div className="max-w-2xl mx-auto">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <div className="brutalist-card p-6 hover:transform-none hover:shadow-[6px_6px_0px_0px]">
            {renderStepContent()}
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="p-4 border-t-4 border-foreground bg-card">
        <div className="max-w-2xl mx-auto flex gap-4">
          <button
            onClick={handlePrev}
            className="flex-1 p-4 border-4 border-foreground font-bold flex items-center justify-center gap-2 hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="flex-1 brutalist-btn flex items-center justify-center gap-2"
          >
            {isLoading ? (
              'Processing...'
            ) : currentStep === 4 ? (
              <>
                <Check className="w-5 h-5" />
                Complete
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  )
}
