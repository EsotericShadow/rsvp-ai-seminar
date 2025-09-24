'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SparklesIcon, CpuChipIcon, CloudIcon } from '@heroicons/react/24/outline'

interface ThinkingIndicatorProps {
  isVisible: boolean
  estimatedTime?: number // in seconds
}

export function ThinkingIndicator({ isVisible, estimatedTime = 3 }: ThinkingIndicatorProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [thinkingText, setThinkingText] = useState('thinking')
  
  const steps = [
    { text: 'thinking', icon: CpuChipIcon },
    { text: 'analyzing', icon: SparklesIcon },
    { text: 'processing', icon: CloudIcon },
    { text: 'generating', icon: SparklesIcon }
  ]

  useEffect(() => {
    if (!isVisible) {
      setProgress(0)
      setCurrentStep(0)
      setThinkingText('thinking')
      return
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (estimatedTime * 10)) // Update every 100ms
        return Math.min(newProgress, 100)
      })
    }, 100)

    const textInterval = setInterval(() => {
      setThinkingText(prev => {
        const dots = prev.split('.').length - 1
        if (dots >= 3) {
          return 'thinking'
        }
        return prev + '.'
      })
    }, 500)

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length)
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(textInterval)
      clearInterval(stepInterval)
    }
  }, [isVisible, estimatedTime])

  if (!isVisible) return null

  const CurrentIcon = steps[currentStep].icon
  const timeLeft = Math.max(0, estimatedTime - (progress / 100) * estimatedTime)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex justify-start mb-4"
      >
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 max-w-sm shadow-sm">
          {/* Header with icon and text */}
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <CurrentIcon className="h-4 w-4 text-blue-600" />
            </motion.div>
            <span className="text-sm font-medium text-blue-900">
              {steps[currentStep].text}
            </span>
            <motion.span
              key={thinkingText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-blue-700 font-mono"
            >
              {thinkingText}
            </motion.span>
          </div>

          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-blue-600 mb-1">
              <span>Processing...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Time estimate */}
          <div className="flex justify-between items-center text-xs text-blue-600">
            <span>Estimated time left:</span>
            <motion.span
              key={timeLeft}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="font-mono"
            >
              {timeLeft > 0 ? `${timeLeft.toFixed(1)}s` : 'Almost done...'}
            </motion.span>
          </div>

          {/* Animated dots */}
          <div className="flex justify-center mt-2">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
