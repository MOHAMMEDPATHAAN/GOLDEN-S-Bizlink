'use client'

import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  error,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const handleChange = (index: number, inputValue: string) => {
    // Only allow digits
    const digit = inputValue.replace(/\D/g, '').slice(-1)
    
    const newValue = value.split('')
    newValue[index] = digit
    const result = newValue.join('').slice(0, length)
    onChange(result)

    // Auto-advance to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1]?.focus()
        const newValue = value.split('')
        newValue[index - 1] = ''
        onChange(newValue.join(''))
      } else {
        // Clear current input
        const newValue = value.split('')
        newValue[index] = ''
        onChange(newValue.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pastedData)
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = pastedData.length < length ? pastedData.length : length - 1
    inputRefs.current[nextEmptyIndex]?.focus()
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-center gap-2">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(-1)}
            disabled={disabled}
            className={cn(
              'otp-input',
              focusedIndex === index && 'border-primary shadow-[4px_4px_0px_0px] shadow-primary',
              error && 'border-destructive',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
      {error && (
        <p className="text-sm text-destructive font-medium text-center">{error}</p>
      )}
    </div>
  )
}
