'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PaperAirplaneIcon, SparklesIcon, XMarkIcon, PauseIcon, PlayIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface FloatingChatBarProps {
  onSendMessage: (message: string) => void
  onToggleWindow: () => void
  isWindowOpen: boolean
  isTyping: boolean
  disabled?: boolean
}

export function FloatingChatBar({
  onSendMessage,
  onToggleWindow,
  isWindowOpen,
  isTyping,
  disabled = false
}: FloatingChatBarProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled && !isTyping) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-4xl bg-gradient-to-r from-emerald-600 to-teal-600 p-2 rounded-t-lg shadow-lg z-50 flex items-center gap-2"
    >
      <button
        onClick={onToggleWindow}
        className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
        title={isWindowOpen ? "Close Chat" : "Open Chat"}
      >
        {isWindowOpen ? <XMarkIcon className="h-5 w-5" /> : <SparklesIcon className="h-5 w-5" />}
      </button>

      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isTyping ? "Juniper is typing..." : "Talk to Juniper..."}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-gray-900"
          disabled={disabled || isTyping}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled || isTyping}
          className="p-2 bg-emerald-700 text-white rounded-full hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </motion.div>
  )
}