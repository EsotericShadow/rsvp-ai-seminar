'use client'

import { useState, useRef, useEffect } from 'react'

interface SplitButtonProps {
  mainAction: () => void
  dropdownActions: Array<{
    id: string
    label: string
    onClick: () => void
    disabled?: boolean
  }>
  mainLabel: string
  mainIcon: React.ReactNode
  dropdownIcon: React.ReactNode
  disabled?: boolean
  loading?: boolean
  className?: string
  mainButtonClassName?: string
  dropdownButtonClassName?: string
}

export function SplitButton({
  mainAction,
  dropdownActions,
  mainLabel,
  mainIcon,
  dropdownIcon,
  disabled = false,
  loading = false,
  className = '',
  mainButtonClassName = '',
  dropdownButtonClassName = ''
}: SplitButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative inline-flex ${className}`} ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={mainAction}
        disabled={disabled || loading}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-l-lg border-r border-white/20 transition-colors ${mainButtonClassName}`}
      >
        {loading ? (
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          mainIcon
        )}
        {mainLabel}
      </button>
      
      {/* Dropdown Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={disabled || loading || dropdownActions.length === 0}
        className={`flex items-center justify-center px-2 py-1.5 text-xs font-medium rounded-r-lg transition-colors ${dropdownButtonClassName}`}
      >
        {dropdownIcon}
      </button>
      
      {/* Dropdown Menu */}
      {showDropdown && dropdownActions.length > 0 && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-white/10 bg-neutral-800 py-1 shadow-lg z-10">
          {dropdownActions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                action.onClick()
                setShowDropdown(false)
              }}
              disabled={action.disabled}
              className="w-full px-3 py-2 text-left text-xs text-neutral-200 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}






