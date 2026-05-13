'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: number
  title: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Mobile view - just shows current/total */}
      <div className="sm:hidden text-center mb-4">
        <span className="text-sm font-bold text-primary">
          Step {currentStep} of {steps.length}
        </span>
        <p className="text-lg font-bold text-foreground">{steps[currentStep - 1]?.title}</p>
      </div>

      {/* Desktop view - full indicator */}
      <div className="hidden sm:flex items-center justify-center">
        {steps.map((step, index) => {
          const isActive = index + 1 === currentStep
          const isCompleted = index + 1 < currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'step-indicator',
                    isActive && 'active',
                    isCompleted && 'completed'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center max-w-[80px]',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    'step-line w-12 md:w-20 -mt-6',
                    isCompleted && 'active'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Progress bar for mobile */}
      <div className="sm:hidden">
        <div className="h-2 bg-muted border-2 border-foreground">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
