'use client'

import { useState } from 'react'
import { 
  RocketLaunchIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

type CampaignTemplate = {
  id: string
  name: string
  description: string
  category: 'welcome' | 'follow-up' | 'nurture' | 're-engagement' | 'announcement' | 'custom'
  steps: number
  estimatedDuration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  icon: React.ReactNode
  color: string
  preview: {
    subject: string
    content: string
  }
}

const campaignTemplates: CampaignTemplate[] = [
  {
    id: 'welcome-series',
    name: 'Welcome Series',
    description: 'A 3-step welcome sequence for new subscribers',
    category: 'welcome',
    steps: 3,
    estimatedDuration: '1 week',
    difficulty: 'beginner',
    tags: ['onboarding', 'welcome', 'introduction'],
    icon: <RocketLaunchIcon className="h-6 w-6" />,
    color: 'bg-success-500',
    preview: {
      subject: 'Welcome to our community!',
      content: 'Thank you for joining us. Here\'s what you can expect...'
    }
  },
  {
    id: 'follow-up-sequence',
    name: 'Follow-up Sequence',
    description: 'A 5-step follow-up sequence for leads',
    category: 'follow-up',
    steps: 5,
    estimatedDuration: '2 weeks',
    difficulty: 'intermediate',
    tags: ['follow-up', 'leads', 'conversion'],
    icon: <EnvelopeIcon className="h-6 w-6" />,
    color: 'bg-primary-500',
    preview: {
      subject: 'Following up on our conversation',
      content: 'I wanted to follow up on our discussion about...'
    }
  },
  {
    id: 'nurture-campaign',
    name: 'Nurture Campaign',
    description: 'A 7-step nurturing sequence for long-term engagement',
    category: 'nurture',
    steps: 7,
    estimatedDuration: '1 month',
    difficulty: 'advanced',
    tags: ['nurture', 'education', 'long-term'],
    icon: <ChartBarIcon className="h-6 w-6" />,
    color: 'bg-warning-500',
    preview: {
      subject: 'Weekly insights and tips',
      content: 'Here are this week\'s top insights to help you...'
    }
  },
  {
    id: 're-engagement',
    name: 'Re-engagement Campaign',
    description: 'A 3-step campaign to re-engage inactive subscribers',
    category: 're-engagement',
    steps: 3,
    estimatedDuration: '1 week',
    difficulty: 'intermediate',
    tags: ['re-engagement', 'win-back', 'retention'],
    icon: <UsersIcon className="h-6 w-6" />,
    color: 'bg-error-500',
    preview: {
      subject: 'We miss you!',
      content: 'It\'s been a while since we\'ve heard from you...'
    }
  },
  {
    id: 'announcement',
    name: 'Product Announcement',
    description: 'A 2-step announcement sequence for new products',
    category: 'announcement',
    steps: 2,
    estimatedDuration: '3 days',
    difficulty: 'beginner',
    tags: ['announcement', 'product', 'launch'],
    icon: <CalendarIcon className="h-6 w-6" />,
    color: 'bg-info-500',
    preview: {
      subject: 'Exciting news: New product launch!',
      content: 'We\'re thrilled to announce our latest product...'
    }
  },
  {
    id: 'custom',
    name: 'Custom Campaign',
    description: 'Start from scratch with a blank campaign',
    category: 'custom',
    steps: 0,
    estimatedDuration: 'Variable',
    difficulty: 'beginner',
    tags: ['custom', 'blank', 'flexible'],
    icon: <ClockIcon className="h-6 w-6" />,
    color: 'bg-neutral-500',
    preview: {
      subject: 'Your custom campaign',
      content: 'Build your own unique email sequence...'
    }
  }
]

type CampaignTemplatesProps = {
  onSelectTemplate: (template: CampaignTemplate) => void
  onClose: () => void
}

export function CampaignTemplates({ onSelectTemplate, onClose }: CampaignTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'All Templates', count: campaignTemplates.length },
    { id: 'welcome', name: 'Welcome', count: campaignTemplates.filter(t => t.category === 'welcome').length },
    { id: 'follow-up', name: 'Follow-up', count: campaignTemplates.filter(t => t.category === 'follow-up').length },
    { id: 'nurture', name: 'Nurture', count: campaignTemplates.filter(t => t.category === 'nurture').length },
    { id: 're-engagement', name: 'Re-engagement', count: campaignTemplates.filter(t => t.category === 're-engagement').length },
    { id: 'announcement', name: 'Announcement', count: campaignTemplates.filter(t => t.category === 'announcement').length },
    { id: 'custom', name: 'Custom', count: campaignTemplates.filter(t => t.category === 'custom').length }
  ]

  const filteredTemplates = campaignTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty
    return matchesCategory && matchesSearch && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-success-500/10 text-success-200 border-success-500/20'
      case 'intermediate':
        return 'bg-warning-500/10 text-warning-200 border-warning-500/20'
      case 'advanced':
        return 'bg-error-500/10 text-error-200 border-error-500/20'
      default:
        return 'bg-neutral-500/10 text-neutral-200 border-neutral-500/20'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-2xl border border-neutral-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Campaign Templates</h2>
              <p className="text-neutral-400 mt-1">Choose a template to get started quickly</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-neutral-700 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Search */}
              <div>
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-white/10 bg-black/60 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-primary-400"
                />
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Categories</h3>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary-500 text-white'
                          : 'text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.name}</span>
                        <span className="text-xs opacity-70">{category.count}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Difficulty</h3>
                <div className="space-y-1">
                  {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedDifficulty === difficulty
                          ? 'bg-primary-500 text-white'
                          : 'text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={() => onSelectTemplate(template)}
                  getDifficultyColor={getDifficultyColor}
                />
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-white mb-2">No templates found</h3>
                <p className="text-neutral-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TemplateCard({
  template,
  onSelect,
  getDifficultyColor
}: {
  template: CampaignTemplate
  onSelect: () => void
  getDifficultyColor: (difficulty: string) => string
}) {
  return (
    <div
      className="border border-white/10 rounded-lg p-4 hover:border-primary-400 hover:bg-primary-500/5 transition-all duration-200 cursor-pointer group"
      onClick={onSelect}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-lg ${template.color} text-white`}>
            {template.icon}
          </div>
          <span className={`px-2 py-1 text-xs rounded-full border ${getDifficultyColor(template.difficulty)}`}>
            {template.difficulty}
          </span>
        </div>

        {/* Content */}
        <div>
          <h3 className="font-semibold text-white group-hover:text-primary-200 transition-colors">
            {template.name}
          </h3>
          <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
            {template.description}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>{template.steps} steps</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            <span>{template.estimatedDuration}</span>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-black/40 rounded-lg p-3 border border-white/5">
          <div className="text-xs text-neutral-500 mb-1">Preview:</div>
          <div className="text-sm text-neutral-300 font-medium">{template.preview.subject}</div>
          <div className="text-xs text-neutral-400 mt-1 line-clamp-2">{template.preview.content}</div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-neutral-700 text-neutral-300 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="px-2 py-1 bg-neutral-700 text-neutral-300 text-xs rounded">
              +{template.tags.length - 3}
            </span>
          )}
        </div>

        {/* Action Button */}
        <button className="w-full flex items-center justify-center gap-2 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors group-hover:bg-primary-500">
          <span>Use Template</span>
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}



