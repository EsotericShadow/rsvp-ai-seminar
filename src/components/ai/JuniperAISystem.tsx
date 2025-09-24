'use client'

import React, { useState, useEffect } from 'react'
import { FloatingChatBar } from './FloatingChatBar'
import { ChatWindow } from './ChatWindow'
import { APIBasedAgent } from '@/lib/agents/APIBasedAgent'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  confidence?: number
  toolCalls?: any[]
  toolResults?: any[]
}

interface AIResponse {
  message: string
  confidence: number
  toolCalls: any[]
  nextSteps: string[]
}

interface JuniperAISystemProps {
  isAdmin?: boolean
}

export function JuniperAISystem({ isAdmin = false }: JuniperAISystemProps) {
  const [aiAgent] = useState(() => new APIBasedAgent())
  const [isWindowOpen, setIsWindowOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [estimatedTime, setEstimatedTime] = useState(3)

  // Initialize with welcome message
  useEffect(() => {
    if (isAdmin && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hi Gabe! I'm Juniper, your AI assistant for the RSVP system.

I have complete understanding of your system including:
• Campaign management and scheduling
• Email template creation and optimization  
• Audience segmentation and management
• Automation workflows and triggers
• Analytics and performance tracking

I'll ask for all the details I need to help you effectively. What would you like to work on?`,
        timestamp: new Date(),
        confidence: 1.0
      }
      setMessages([welcomeMessage])
    }
  }, [isAdmin, messages.length])

  const calculateEstimatedTime = (message: string): number => {
    const messageLower = message.toLowerCase()
    
    // Simple queries
    if (messageLower.includes('help') || messageLower.includes('what can you do')) {
      return 1.5
    }
    
    // Template creation
    if (messageLower.includes('template') && messageLower.includes('create')) {
      return 2.5
    }
    
    // Campaign creation
    if (messageLower.includes('campaign') && messageLower.includes('create')) {
      return 3.5
    }
    
    // Complex queries
    if (messageLower.includes('analyze') || messageLower.includes('report')) {
      return 4
    }
    
    // Default
    return 2.5
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isTyping || isPaused) return

    // Calculate estimated time based on message complexity
    const estimatedTime = calculateEstimatedTime(message)
    setEstimatedTime(estimatedTime)
    setIsTyping(true)

    try {
      const response = await aiAgent.processMessage(message)

      // Add user message
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date()
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        toolCalls: response.toolCalls,
        toolResults: response.toolResults,
        confidence: response.confidence
      }

      setMessages(prev => [...prev, userMessage, assistantMessage])

    } catch (error) {
      console.error('Error processing message:', error)
      
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date()
      }, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleToggleWindow = () => {
    setIsWindowOpen(!isWindowOpen)
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  if (!isAdmin) return null

  return (
    <>
      <FloatingChatBar
        onSendMessage={handleSendMessage}
        onToggleWindow={handleToggleWindow}
        isWindowOpen={isWindowOpen}
        isTyping={isTyping}
        disabled={isPaused}
      />
      
      <ChatWindow
        isOpen={isWindowOpen}
        onClose={() => setIsWindowOpen(false)}
        messages={messages}
        isTyping={isTyping}
        estimatedTime={estimatedTime}
      />
    </>
  )
}
