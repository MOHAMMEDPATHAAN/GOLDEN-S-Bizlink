"use client"

import { forwardRef, ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface FastButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "xs" | "sm" | "md" | "lg"
  loading?: boolean
  icon?: React.ReactNode
}

export const FastButton = forwardRef<HTMLButtonElement, FastButtonProps>(
  ({ className, variant = "primary", size = "md", loading, icon, children, disabled, ...props }, ref) => {
    const baseStyles = "font-bold border-2 border-foreground inline-flex items-center justify-center gap-2 select-none cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0"
    
    const variants = {
      primary: "bg-primary text-primary-foreground shadow-[3px_3px_0px_0px] shadow-foreground hover:shadow-[4px_4px_0px_0px] hover:-translate-x-[1px] hover:-translate-y-[1px]",
      secondary: "bg-card text-foreground shadow-[3px_3px_0px_0px] shadow-foreground hover:bg-muted hover:shadow-[4px_4px_0px_0px] hover:-translate-x-[1px] hover:-translate-y-[1px]",
      ghost: "bg-transparent border-transparent shadow-none hover:bg-muted",
      danger: "bg-destructive text-destructive-foreground shadow-[3px_3px_0px_0px] shadow-foreground hover:shadow-[4px_4px_0px_0px] hover:-translate-x-[1px] hover:-translate-y-[1px]",
    }
    
    const sizes = {
      xs: "px-2 py-1 text-xs",
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          "transition-[transform,box-shadow] duration-[50ms] ease-out",
          "-webkit-tap-highlight-color-transparent",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </button>
    )
  }
)

FastButton.displayName = "FastButton"
