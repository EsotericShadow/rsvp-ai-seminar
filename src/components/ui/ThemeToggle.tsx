'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Button } from './Button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ] as const

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Theme
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Choose your preferred theme
        </p>
      </div>
      
      <div className="flex gap-2">
        {themes.map((themeOption) => (
          <Button
            key={themeOption.value}
            variant={theme === themeOption.value ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTheme(themeOption.value)}
            className="flex items-center gap-2"
          >
            <span>{themeOption.icon}</span>
            <span>{themeOption.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}


