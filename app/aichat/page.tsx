"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send, Sparkles, User, Loader2, Copy, Check, RefreshCw, Trash2, HelpCircle, Package, TrendingUp, Settings, MessageCircle } from "lucide-react"
import { useAppStore } from "@/lib/store"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

const SUGGESTED_PROMPTS = [
  { icon: HelpCircle, text: "How do I add a new product?" },
  { icon: Package, text: "How can I increase my product visibility?" },
  { icon: TrendingUp, text: "Tips for getting more wholesale inquiries" },
  { icon: Settings, text: "How do I update my company profile?" },
  { icon: MessageCircle, text: "How does the chat feature work?" },
]

export default function AIChatPage() {
  const router = useRouter()
  const { user, company } = useAppStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem("bizlink_ai_chat")
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
  }, [])

  useEffect(() => {
    // Save chat history to localStorage
    if (messages.length > 0) {
      localStorage.setItem("bizlink_ai_chat", JSON.stringify(messages))
    }
  }, [messages])

  const handleSubmit = async (content: string = input) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponses: Record<string, string> = {
        "How do I add a new product?": `To add a new product, follow these steps:

1. **Go to Products** - Tap the Products icon in the bottom navigation
2. **Click Add** - Tap the + button in the top right corner
3. **Fill in Details** - Enter your product name, description, and category
4. **Upload Images** - Add high-quality images of your product
5. **Set Pricing** - Enter your price range and minimum order quantity
6. **Add Specifications** - Include material, dimensions, weight, etc.
7. **Publish** - Review and tap "Publish Product"

**Pro Tip:** Products with complete information and multiple images get 3x more views!`,

        "How can I increase my product visibility?": `Here are proven ways to boost your product visibility on Bizlink:

**Optimize Your Listings**
- Use clear, descriptive titles with relevant keywords
- Write detailed descriptions highlighting key features
- Add 5+ high-quality images from different angles

**Stay Active**
- Post regular updates and announcements
- Create engaging Reels showcasing your products
- Respond quickly to inquiries (under 1 hour is ideal)

**Build Your Network**
- Follow relevant companies in your industry
- Engage with content from potential partners
- Share your products on social media

**Upgrade to Premium**
- Get featured in search results
- Access analytics to optimize your strategy
- Priority customer support`,

        "Tips for getting more wholesale inquiries": `Great question! Here's how to attract more wholesale buyers:

**1. Competitive Pricing**
- Display clear bulk pricing tiers
- Offer volume discounts
- Be transparent about MOQ

**2. Build Trust**
- Complete your company profile (100%)
- Add certifications and awards
- Showcase customer testimonials

**3. Fast Communication**
- Enable notifications for new messages
- Respond within 24 hours
- Be professional and detailed

**4. Quality Content**
- Post product videos and Reels
- Share behind-the-scenes content
- Highlight your production process

**5. Networking**
- Attend virtual trade shows
- Connect with industry leaders
- Join relevant business groups`,

        "How do I update my company profile?": `Updating your company profile is easy:

1. **Go to Profile** - Tap the Profile icon in the bottom navigation
2. **Edit Profile** - Tap the "Edit Profile" button
3. **Update Information**:
   - Company name and logo
   - CEO name and photo
   - Company description
   - Contact information
   - Address and location
   - Social media links
4. **Save Changes** - Tap "Save" when done

**Important Fields to Complete:**
- Company description (helps with search)
- Production types (helps matching)
- Operating hours (shows availability)
- Social media links (builds credibility)

A complete profile gets 50% more views!`,

        "How does the chat feature work?": `The Bizlink chat feature connects you with potential partners:

**Starting a Conversation**
- Visit a company's profile and tap "Message"
- Or respond to an inquiry notification

**Chat Features**
- Real-time messaging
- Read receipts (double blue checkmarks)
- Image and file sharing
- Voice and video calls

**Best Practices**
- Respond within 24 hours
- Be professional and courteous
- Share relevant product information
- Follow up on pending conversations

**Privacy**
- You can control who can message you in Settings
- Block users if needed
- Report inappropriate behavior

Need more help? Feel free to ask!`,
      }

      const responseContent = aiResponses[content.trim()] || 
        `Thank you for your question! I'm here to help you with anything related to Bizlink.

You can ask me about:
- Adding and managing products
- Increasing visibility and engagement
- Using chat and networking features
- Account settings and profile optimization
- Subscription plans and features

Is there something specific you'd like to know? I'm happy to provide detailed guidance!`

      const aiMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: responseContent,
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRetry = (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1]
      // Remove the AI response and retry
      setMessages(messages.slice(0, messageIndex))
      setTimeout(() => handleSubmit(userMessage.content), 100)
    }
  }

  const clearChat = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      setMessages([])
      localStorage.removeItem("bizlink_ai_chat")
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b-4 border-foreground flex items-center justify-between p-4 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary border-2 border-foreground flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold">Bizlink AI</h1>
            <p className="text-xs text-muted-foreground">Your business assistant</p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-2 hover:bg-muted transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Welcome to Bizlink AI</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              I'm here to help you grow your business on Bizlink. Ask me anything!
            </p>

            <div className="w-full max-w-md space-y-2">
              <p className="text-sm font-bold text-muted-foreground mb-3">Suggested questions:</p>
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSubmit(prompt.text)}
                  className="w-full p-3 brutalist-card flex items-center gap-3 text-left hover:bg-muted transition-colors"
                >
                  <prompt.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] ${message.role === "user" ? "order-2" : "order-1"}`}>
                {/* Avatar */}
                <div className={`flex items-start gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full border-2 border-foreground flex-shrink-0 flex items-center justify-center ${
                    message.role === "user" ? "bg-card" : "bg-primary"
                  }`}>
                    {message.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>

                  <div className={`chat-bubble ${message.role === "user" ? "sent" : "received"}`}>
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    
                    {/* Actions for AI messages */}
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-current/20">
                        <button
                          onClick={() => handleCopy(message.id, message.content)}
                          className="p-1 hover:bg-black/10 transition-colors rounded"
                          title="Copy"
                        >
                          {copiedId === message.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRetry(message.id)}
                          className="p-1 hover:bg-black/10 transition-colors rounded"
                          title="Retry"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-primary border-2 border-foreground flex-shrink-0 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="chat-bubble received">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-card border-t-4 border-foreground p-4 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="Ask me anything..."
            rows={1}
            className="brutalist-input flex-1 resize-none max-h-32"
            style={{ minHeight: "48px" }}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isLoading}
            className="brutalist-btn p-3 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Bizlink AI may produce inaccurate information. Always verify important details.
        </p>
      </div>
    </div>
  )
}
