"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Star, Send, MessageCircle, Bug, Lightbulb, ThumbsUp, Check } from "lucide-react"
import { useAppStore } from "@/lib/store"

type FeedbackType = "general" | "bug" | "feature" | "praise"

export default function FeedbackPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("general")
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState(user?.email || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const feedbackTypes = [
    { type: "general" as const, icon: MessageCircle, label: "General" },
    { type: "bug" as const, icon: Bug, label: "Report Bug" },
    { type: "feature" as const, icon: Lightbulb, label: "Feature Request" },
    { type: "praise" as const, icon: ThumbsUp, label: "Praise" },
  ]

  const handleSubmit = async () => {
    if (!message.trim()) return

    setIsSubmitting(true)
    try {
      // Mock submission
      await new Promise(r => setTimeout(r, 1500))
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="brutalist-card p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500 border-4 border-foreground flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-muted-foreground mb-6">
            Your feedback has been received. We appreciate you taking the time to help us improve Bizlink.
          </p>
          <button
            onClick={() => router.back()}
            className="brutalist-btn w-full"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b-4 border-foreground sticky top-0 z-40">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted transition-colors border-2 border-transparent hover:border-foreground"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Send Feedback</h1>
        </div>
      </header>

      <div className="p-4 max-w-lg mx-auto pb-20">
        {/* Feedback Type */}
        <div className="brutalist-card p-4 mb-4">
          <h2 className="font-bold mb-3">What type of feedback?</h2>
          <div className="grid grid-cols-2 gap-2">
            {feedbackTypes.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setFeedbackType(type)}
                className={`p-3 border-2 flex flex-col items-center gap-2 transition-colors ${
                  feedbackType === type
                    ? "border-primary bg-primary/10"
                    : "border-foreground hover:bg-muted"
                }`}
              >
                <Icon className={`w-6 h-6 ${feedbackType === type ? "text-primary" : ""}`} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="brutalist-card p-4 mb-4">
          <h2 className="font-bold mb-3">How would you rate your experience?</h2>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {rating === 0 && "Tap to rate"}
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent!"}
          </p>
        </div>

        {/* Message */}
        <div className="brutalist-card p-4 mb-4">
          <h2 className="font-bold mb-3">Your feedback</h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              feedbackType === "bug" 
                ? "Please describe the bug in detail. Include steps to reproduce if possible..."
                : feedbackType === "feature"
                ? "Describe the feature you'd like to see..."
                : "Share your thoughts with us..."
            }
            rows={5}
            className="brutalist-input w-full resize-none"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {message.length}/1000 characters
          </p>
        </div>

        {/* Email */}
        <div className="brutalist-card p-4 mb-4">
          <h2 className="font-bold mb-3">Contact email (optional)</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="brutalist-input w-full"
          />
          <p className="text-sm text-muted-foreground mt-2">
            We'll only use this to follow up on your feedback if needed.
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || isSubmitting}
          className="brutalist-btn w-full flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Feedback
            </>
          )}
        </button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Your feedback helps us improve Bizlink for everyone.
        </p>
      </div>
    </div>
  )
}
