'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { RealDatabaseAgent, ChatMessage, ToolCall, ToolResult } from '@/lib/agents/RealDatabaseAgent'

interface PersonalAIAssistantProps {
  // Only show for admin/Gabe
  isAdmin?: boolean
}

export function PersonalAIAssistant({ isAdmin = false }: PersonalAIAssistantProps) {
  const [aiAgent] = useState(() => new RealDatabaseAgent())
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)

  // Only show for admin
  if (!isAdmin) return null

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isTyping) return

    const userMessage = message.trim()
    setMessage('')
    setIsTyping(true)

    try {
      // Use the real AI agent
      const response = await aiAgent.processMessage(userMessage)
      
      // Update messages with the response from the agent
      setMessages(prev => [...prev, 
        {
          id: `msg_${Date.now()}`,
          role: 'user',
          content: userMessage,
          timestamp: new Date()
        },
        {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          toolCalls: response.toolCalls,
          toolResults: response.toolCalls.map(tc => ({
            toolCallId: tc.id,
            success: tc.status === 'completed',
            result: tc.status === 'completed' ? 'Executed successfully' : undefined,
            error: tc.status === 'failed' ? 'Execution failed' : undefined
          }))
        }
      ])

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      }, {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const quickActions = [
    "Create a new campaign",
    "Show campaign performance", 
    "Analyze audience data",
    "Check recent RSVPs",
    "Create email template",
    "Check system status"
  ]

  return (
    <>
      {/* Floating AI Button */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          title="Personal AI Assistant"
        >
          <SparklesIcon className="h-6 w-6" />
        </motion.button>
      )}

      {/* AI Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
            style={{ height: isMinimized ? 60 : 500 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-white" />
                <span className="text-white font-semibold text-sm">Personal AI</span>
                {isTyping && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded"
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: 350 }}>
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      <p className="text-sm">Hi Gabe! I'm your personal AI assistant for the RSVP system.</p>
                      <p className="text-xs mt-2">I can help you manage campaigns, analyze data, and optimize your email system.</p>
                    </div>
                  )}

                  {messages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                          msg.role === 'user'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        
                        {/* Tool Calls */}
                        {msg.toolCalls && msg.toolCalls.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium opacity-75">Executing tools:</p>
                            {msg.toolCalls.map((toolCall) => (
                              <div key={toolCall.id} className="flex items-center gap-2 text-xs">
                                {toolCall.status === 'completed' && <CheckCircleIcon className="h-3 w-3 text-green-500" />}
                                {toolCall.status === 'failed' && <XCircleIcon className="h-3 w-3 text-red-500" />}
                                {toolCall.status === 'running' && <ClockIcon className="h-3 w-3 text-blue-500 animate-pulse" />}
                                {toolCall.status === 'pending' && <ClockIcon className="h-3 w-3 text-gray-400" />}
                                <span className="font-mono">
                                  {toolCall.name.replace('_', ' ')} ({JSON.stringify(toolCall.parameters)})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tool Results */}
                        {msg.toolResults && msg.toolResults.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium opacity-75">Results:</p>
                            {msg.toolResults.map((result, idx) => (
                              <div key={idx} className="text-xs">
                                {result.success ? (
                                  <span className="text-green-600">✅ {JSON.stringify(result.result, null, 2)}</span>
                                ) : (
                                  <span className="text-red-600">❌ {result.error}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg text-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-2 font-medium">Quick Actions:</p>
                  <div className="flex flex-wrap gap-1">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => setMessage(action)}
                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-full hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask me about your RSVP system..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      disabled={isTyping}
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() || isTyping}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
