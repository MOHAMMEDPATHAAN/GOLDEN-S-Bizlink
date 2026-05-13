'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, User, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string | null
  onChange: (file: File | null, preview: string | null) => void
  type: 'face' | 'logo'
  label?: string
  error?: string
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  type,
  label,
  error,
  className,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isDragging, setIsDragging] = useState(false)
  const [faceDetected, setFaceDetected] = useState<boolean | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File | null) => {
    if (!file) {
      setPreview(null)
      setFaceDetected(null)
      onChange(null, null)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)

      // Simple face detection simulation (in real app, use TensorFlow.js or similar)
      if (type === 'face') {
        // For demo purposes, we'll assume face is detected
        // In production, implement actual face detection
        setTimeout(() => {
          setFaceDetected(true)
        }, 500)
      }

      onChange(file, dataUrl)
    }
    reader.readAsDataURL(file)
  }, [onChange, type])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleRemove = () => {
    setPreview(null)
    setFaceDetected(null)
    onChange(null, null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-bold text-foreground uppercase tracking-wide">
          {label}
        </label>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-4 border-dashed transition-all',
          type === 'face' ? 'w-32 h-32 rounded-full mx-auto' : 'w-full h-40',
          isDragging
            ? 'border-primary bg-primary/10'
            : error
              ? 'border-destructive bg-destructive/5'
              : 'border-muted-foreground/30 hover:border-primary'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={label || 'Upload image'}
        />

        {preview ? (
          <div className={cn(
            'relative w-full h-full overflow-hidden',
            type === 'face' && 'rounded-full'
          )}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className={cn(
                'absolute bg-destructive text-destructive-foreground p-1 border-2 border-foreground',
                type === 'face' ? 'top-0 right-0' : 'top-2 right-2'
              )}
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Face detection indicator */}
            {type === 'face' && faceDetected !== null && (
              <div className={cn(
                'absolute bottom-0 left-0 right-0 py-1 text-center text-xs font-bold',
                faceDetected
                  ? 'bg-green-500 text-white'
                  : 'bg-destructive text-white'
              )}>
                {faceDetected ? 'Face Detected' : 'No Face'}
              </div>
            )}
          </div>
        ) : (
          <div className={cn(
            'flex flex-col items-center justify-center h-full gap-2 p-4',
            type === 'face' && 'rounded-full'
          )}>
            {type === 'face' ? (
              <User className="w-10 h-10 text-muted-foreground" />
            ) : type === 'logo' ? (
              <Building2 className="w-10 h-10 text-muted-foreground" />
            ) : (
              <Upload className="w-10 h-10 text-muted-foreground" />
            )}
            {type !== 'face' && (
              <p className="text-sm text-muted-foreground text-center">
                Drop image here or click to upload
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive font-medium text-center">{error}</p>
      )}

      {type === 'face' && !preview && (
        <p className="text-xs text-muted-foreground text-center">
          Upload a clear photo of your face
        </p>
      )}
    </div>
  )
}
