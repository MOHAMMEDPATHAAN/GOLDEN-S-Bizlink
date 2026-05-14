"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Send, Paperclip, Image as ImageIcon, MoreVertical, Phone, Video, User, Check, CheckCheck, Clock, Smile, X, Search, Plus, Building2 } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { BottomNav } from "@/components/bottom-nav"
import { AIChatFab } from "@/components/ai-chat-fab"
import { AppHeader } from "@/components/app-header"

interface ChatConversation {
  id: string
  participantId: string
  participantName: string
  participantLogo?: string
  participantType: "company" | "salesman"
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
}

interface ChatMessage {
  id: string
  senderId: string
  content: string
  timestamp: string
  status: "sent" | "delivered" | "read"
  type: "text" | "image" | "file"
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="w-full h-full bg-background" />}>
      <ChatPageContent />
    </Suspense>
  )
}

function ChatPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get("id")
  const { user, settings } = useAppStore()
  
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (conversationId) {
      const conv = conversations.find(c => c.id === conversationId)
      if (conv) {
        setActiveConversation(conv)
        loadMessages(conversationId)
      }
    }
  }, [conversationId, conversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadConversations = async () => {
    setIsLoading(true)
    try {
      // Mock conversations
      const mockConversations: ChatConversation[] = Array.from({ length: 8 }, (_, i) => ({
        id: `conv-${i + 1}`,
        participantId: `user-${i + 1}`,
        participantName: `Company ${i + 1}`,
        participantType: "company",
        lastMessage: [
          "Thanks for your inquiry about our products!",
          "What quantities are you looking for?",
          "We can offer a 15% discount for bulk orders",
          "Please check the attached catalog",
          "Looking forward to working with you",
        ][i % 5],
        lastMessageTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        unreadCount: Math.floor(Math.random() * 5),
        isOnline: Math.random() > 0.5,
      }))
      setConversations(mockConversations)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (convId: string) => {
    // Mock messages
    const mockMessages: ChatMessage[] = Array.from({ length: 15 }, (_, i) => ({
      id: `msg-${i + 1}`,
      senderId: i % 3 === 0 ? user?.id || "me" : "other",
      content: [
        "Hello! I'm interested in your products.",
        "Hi there! Thanks for reaching out. How can I help you?",
        "I'm looking for wholesale pricing on your electronics line.",
        "Sure! We have great bulk pricing. What quantities are you looking at?",
        "Around 500-1000 units per month.",
        "That's great! For that volume, we can offer a 20% discount.",
        "That sounds good. Can you send me a catalog?",
        "Of course! I'll send it right over.",
        "Thanks! Also, what's your minimum order quantity?",
        "Our MOQ is 100 units per product.",
        "Perfect. Let me review the catalog and get back to you.",
        "Take your time! Let me know if you have any questions.",
        "Will do. Thanks for your help!",
        "You're welcome! Looking forward to working with you.",
        "Same here. Talk soon!",
      ][i % 15],
      timestamp: new Date(Date.now() - (15 - i) * 10 * 60 * 1000).toISOString(),
      status: i === 14 ? "sent" : i === 13 ? "delivered" : "read",
      type: "text",
    }))
    setMessages(mockMessages)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || "me",
      content: newMessage,
      timestamp: new Date().toISOString(),
      status: "sent",
      type: "text",
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 24) return formatTime(dateString)
    if (hours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Conversation list view
  if (!activeConversation) {
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
            <h1 className="text-xl font-bold">Messages</h1>
            <button className="p-2 hover:bg-muted transition-colors border-2 border-transparent hover:border-foreground">
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="brutalist-input w-full pl-10"
              />
            </div>
          </div>
        </header>

        {/* Conversations List */}
        <div className="divide-y-2 divide-foreground">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-3">
                <div className="w-14 h-14 rounded-full skeleton-gold" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton-gold w-32" />
                  <div className="h-3 skeleton-gold w-48" />
                </div>
              </div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-bold text-lg">No Conversations</h3>
              <p className="text-muted-foreground">Start a conversation with a company</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConversation(conv)
                  loadMessages(conv.id)
                }}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted transition-colors text-left"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-4 border-foreground bg-primary flex items-center justify-center overflow-hidden">
                    {conv.participantLogo ? (
                      <img src={conv.participantLogo} alt={conv.participantName} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-7 h-7 text-primary-foreground" />
                    )}
                  </div>
                  {conv.isOnline && settings.showOnlineStatus && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold truncate">{conv.participantName}</p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDate(conv.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNav userType={user?.role === "salesman" || user?.role === "viewer" ? "salesman" : "company"} />

        {/* AI Chat FAB */}
        <AIChatFab />
      </div>
    )
  }

  // Chat view
  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Chat Header */}
      <header className="bg-card border-b-4 border-foreground flex items-center justify-between p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveConversation(null)}
            className="p-2 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => router.push(`/company/${activeConversation.participantId}`)}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-foreground bg-primary flex items-center justify-center overflow-hidden">
                {activeConversation.participantLogo ? (
                  <img src={activeConversation.participantLogo} alt={activeConversation.participantName} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-5 h-5 text-primary-foreground" />
                )}
              </div>
              {activeConversation.isOnline && settings.showOnlineStatus && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">{activeConversation.participantName}</p>
              <p className="text-xs text-muted-foreground">
                {activeConversation.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-muted transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-muted transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-muted transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message, index) => {
          const isMe = message.senderId === user?.id || message.senderId === "me"
          const showTime = index === 0 || 
            new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 5 * 60 * 1000

          return (
            <div key={message.id}>
              {showTime && (
                <div className="text-center my-4">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              )}
              
              <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`chat-bubble ${isMe ? "sent" : "received"}`}>
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                    {isMe && (
                      message.status === "read" ? (
                        <CheckCheck className="w-3 h-3 text-blue-400" />
                      ) : message.status === "delivered" ? (
                        <CheckCheck className="w-3 h-3 opacity-70" />
                      ) : (
                        <Check className="w-3 h-3 opacity-70" />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-card border-t-4 border-foreground p-4 flex items-center gap-2 flex-shrink-0">
        <button className="p-2 hover:bg-muted transition-colors">
          <Paperclip className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-muted transition-colors">
          <ImageIcon className="w-5 h-5" />
        </button>
        
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message..."
          className="brutalist-input flex-1"
        />
        
        <button className="p-2 hover:bg-muted transition-colors">
          <Smile className="w-5 h-5" />
        </button>
        
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="brutalist-btn p-3"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
