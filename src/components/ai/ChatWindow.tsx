'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, MinusIcon, Square2StackIcon, SparklesIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { ChatMessage, ExtractedEntity } from '@/lib/agents/SLMAgent'

interface ChatWindowProps {
  isOpen: boolean
  onClose: () => void
  messages: ChatMessage[]
  isTyping: boolean
}

export function ChatWindow({ isOpen, onClose, messages, isTyping }: ChatWindowProps) {
  const chatWindowRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ width: 400, height: 600 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])

  // Reset position and size when opened
  useEffect(() => {
    if (isOpen) {
      setPosition({ x: window.innerWidth - size.width - 20, y: window.innerHeight - size.height - 80 })
      setIsMinimized(false)
      setIsMaximized(false)
    }
  }, [isOpen, size.width, size.height])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (chatWindowRef.current && !isMaximized) {
      const target = e.target as HTMLElement;
      // Only drag if clicking on the header, not buttons or chat area
      if (target.closest('.chat-header') && !target.closest('button')) {
        setIsDragging(true)
        dragOffset.current = {
          x: e.clientX - chatWindowRef.current.getBoundingClientRect().left,
          y: e.clientY - chatWindowRef.current.getBoundingClientRect().top,
        }
      }
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && chatWindowRef.current && !isMaximized) {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      })
    }
    if (isResizing && chatWindowRef.current && !isMaximized) {
      const newWidth = e.clientX - chatWindowRef.current.getBoundingClientRect().left
      const newHeight = e.clientY - chatWindowRef.current.getBoundingClientRect().top
      setSize({
        width: Math.max(300, newWidth),
        height: Math.max(300, newHeight),
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  })

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
    if (!isMaximized) {
      // Save current position/size if not already maximized
      // For simplicity, we'll just let it go full screen
      setPosition({ x: 0, y: 0 })
      setSize({ width: window.innerWidth, height: window.innerHeight - 60 }) // Account for floating bar
    } else {
      // Restore to default size/position
      setSize({ width: 400, height: 600 })
      setPosition({ x: window.innerWidth - 400 - 20, y: window.innerHeight - 600 - 80 })
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={chatWindowRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="fixed bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col z-40"
          style={{
            width: isMaximized ? '100vw' : size.width,
            height: isMaximized ? 'calc(100vh - 60px)' : size.height, // Adjust for floating bar
            top: isMaximized ? 0 : position.y,
            left: isMaximized ? 0 : position.x,
            right: isMaximized ? 0 : 'auto',
            bottom: isMaximized ? '60px' : 'auto', // Adjust for floating bar
            transform: isDragging ? 'scale(1.01)' : 'scale(1)',
            cursor: isDragging ? 'grabbing' : isResizing ? 'nwse-resize' : 'default',
          }}
        >
          {/* Header */}
          <div
            className="chat-header bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-white" />
              <span className="text-white font-semibold">Juniper AI Assistant</span>
              {isTyping && (
                <div className="flex space-x-1 ml-2">
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
                title={isMinimized ? "Restore" : "Minimize"}
              >
                {isMinimized ? (
                  <Square2StackIcon className="w-4 h-4" />
                ) : (
                  <MinusIcon className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={toggleMaximize}
                className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded"
                title={isMaximized ? "Restore" : "Maximize"}
              >
                <Square2StackIcon className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded"
                title="Close"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 text-gray-900">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <SparklesIcon className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Hi Gabe! I&apos;m Juniper, your personal AI assistant.</p>
                    <p className="text-xs mt-2">I can help you manage campaigns, analyze data, and optimize your email system.</p>
                  </div>
                )}

                {messages.map((msg) => (
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
                                {toolCall.name.replace(/_/g, ' ')} ({JSON.stringify(toolCall.parameters)})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                          {/* Extracted Entities */}
                          {msg.entities && msg.entities.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs font-medium opacity-75">Extracted:</p>
                              <div className="flex flex-wrap gap-1">
                                {msg.entities.map((entity, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                    title={`${entity.type}: ${entity.value} (${Math.round(entity.confidence * 100)}%)`}
                                  >
                                    {entity.type}: {entity.value}
                                  </span>
                                ))}
                              </div>
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
                <div ref={messagesEndRef} />
              </div>

              {/* Resize Handle */}
              {!isMaximized && (
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-gray-300 hover:bg-gray-400 rounded-tl-lg"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    setIsResizing(true)
                  }}
                />
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}