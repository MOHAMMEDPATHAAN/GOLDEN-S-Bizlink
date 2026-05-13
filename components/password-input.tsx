'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import zxcvbn from 'zxcvbn'

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  showStrengthMeter?: boolean
  className?: string
  error?: string
  id?: string
  name?: string
}

export function PasswordInput({
  value,
  onChange,
  placeholder = 'Enter password',
  showStrengthMeter = false,
  className,
  error,
  id,
  name,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [strength, setStrength] = useState(0)
  const [strengthLabel, setStrengthLabel] = useState('')

  useEffect(() => {
    if (showStrengthMeter && value) {
      const result = zxcvbn(value)
      setStrength(result.score)
      const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
      setStrengthLabel(labels[result.score])
    } else {
      setStrength(0)
      setStrengthLabel('')
    }
  }, [value, showStrengthMeter])

  const strengthColors = [
    'bg-destructive',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
  ]

  const strengthWidths = ['w-1/5', 'w-2/5', 'w-3/5', 'w-4/5', 'w-full']

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          id={id}
          name={name}
          className={cn(
            'brutalist-input w-full pr-12',
            error && 'border-destructive',
            className
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {showStrengthMeter && value && (
        <div className="space-y-1">
          <div className="strength-meter">
            <div
              className={cn(
                'h-full transition-all duration-300',
                strengthColors[strength],
                strengthWidths[strength]
              )}
            />
          </div>
          <p className={cn(
            'text-xs font-medium',
            strength < 2 ? 'text-destructive' : strength < 3 ? 'text-yellow-600' : 'text-green-600'
          )}>
            Password Strength: {strengthLabel}
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}
    </div>
  )
}
