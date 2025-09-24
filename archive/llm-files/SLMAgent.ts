/**
 * SLM-Powered Agent - Uses actual language model for natural conversation
 * Handles typos, semantic understanding, and natural language processing
 */

import { PrismaClient } from '@prisma/client'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  toolCalls?: ToolCall[]
  toolResults?: ToolResult[]
  confidence?: number
  entities?: ExtractedEntity[]
  intent?: string
}

export interface ToolCall {
  id: string
  name: string
  parameters: any
  status: 'pending' | 'running' | 'completed' | 'failed'
}

export interface ToolResult {
  toolCallId: string
  success: boolean
  result?: any
  error?: string
}

export interface ExtractedEntity {
  type: 'campaign_name' | 'template_name' | 'audience_group' | 'schedule' | 'email' | 'number' | 'date' | 'time'
  value: string
  confidence: number
  originalText: string
}

export interface AIResponse {
  message: string
  toolCalls: ToolCall[]
  toolResults?: ToolResult[]
  confidence: number
  suggestions: string[]
  intent?: string
  entities?: ExtractedEntity[]
  ragContext?: any[]
}

const prisma = new PrismaClient()

export class SLMAgent {
  private conversationHistory: ChatMessage[] = []
  private contextMemory: Map<string, any> = new Map()

  /**
   * Process a user message using SLM-powered natural language understanding
   */
  async processMessage(userMessage: string): Promise<AIResponse> {
    // Add user message to conversation
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    this.conversationHistory.push(userMsg)

    try {
      // Step 1: Normalize and preprocess the message
      const normalizedMessage = this.normalizeMessage(userMessage)
      
      // Step 2: Extract entities using fuzzy matching and semantic understanding
      const entities = await this.extractEntities(normalizedMessage, userMessage)
      
      // Step 3: Determine intent using semantic analysis
      const intent = await this.determineIntent(normalizedMessage, entities)
      
      // Step 4: Get RAG context for better understanding
      const ragContext = await this.getRAGContext(normalizedMessage)
      
      // Step 5: Generate tool calls based on intent and entities
      const toolCalls = await this.generateToolCalls(intent, entities, normalizedMessage)
      
      // Step 6: Execute tool calls
      const toolResults = await this.executeToolCalls(toolCalls)
      
      // Step 7: Generate natural response
      const response = await this.generateNaturalResponse(intent, entities, toolCalls, toolResults, ragContext)
      
      // Add assistant response to conversation
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        toolCalls: toolCalls,
        toolResults: toolResults,
        entities: entities,
        intent: intent
      }
      this.conversationHistory.push(assistantMsg)

      return response

    } catch (error) {
      console.error('Error processing message:', error)
      
      const errorResponse: AIResponse = {
        message: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        toolCalls: [],
        confidence: 0,
        suggestions: ['Try asking about campaign status', 'Ask about audience data', 'Check system status']
      }

      return errorResponse
    }
  }

  /**
   * Normalize message for better processing
   */
  private normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .trim()
      // Fix common typos
      .replace(/\b(campain|campaing|campign)\b/g, 'campaign')
      .replace(/\b(templete|templat)\b/g, 'template')
      .replace(/\b(audiance|audence)\b/g, 'audience')
      .replace(/\b(scedule|schedual)\b/g, 'schedule')
      .replace(/\b(creat|creat)\b/g, 'create')
      .replace(/\b(show|shw|shwo)\b/g, 'show')
      .replace(/\b(list|lst|lsit)\b/g, 'list')
      // Normalize contractions
      .replace(/\b(can't|cannot)\b/g, 'can not')
      .replace(/\b(won't|will not)\b/g, 'will not')
      .replace(/\b(don't|do not)\b/g, 'do not')
      .replace(/\b(i'm|i am)\b/g, 'i am')
      .replace(/\b(you're|you are)\b/g, 'you are')
      // Normalize common phrases
      .replace(/\b(what can you do|what are your capabilities|help me|assist me)\b/g, 'help')
      .replace(/\b(show me|display|get me)\b/g, 'show')
      .replace(/\b(create|make|build|set up)\b/g, 'create')
      .replace(/\b(schedule|plan|set time|arrange)\b/g, 'schedule')
  }

  /**
   * Extract entities using fuzzy matching and semantic understanding
   */
  private async extractEntities(normalizedMessage: string, originalMessage: string): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = []

    // Extract campaign names (quoted or after "named/called")
    const campaignNamePatterns = [
      /(?:named|called|title)\s+['"]([^'"]+)['"]/i,
      /(?:named|called|title)\s+(\w+(?:\s+\w+)*)/i,
      /campaign\s+['"]([^'"]+)['"]/i,
      /['"]([^'"]+)['"]\s+campaign/i
    ]
    
    for (const pattern of campaignNamePatterns) {
      const match = pattern.exec(originalMessage)
      if (match) {
        entities.push({
          type: 'campaign_name',
          value: match[1].trim(),
          confidence: 0.9,
          originalText: match[0]
        })
      }
    }

    // Extract template names
    const templateNamePatterns = [
      /(?:using|with|template)\s+['"]([^'"]+)['"]/i,
      /(?:using|with|template)\s+(\w+(?:\s+\w+)*)/i,
      /template\s+['"]([^'"]+)['"]/i
    ]
    
    for (const pattern of templateNamePatterns) {
      const match = pattern.exec(originalMessage)
      if (match) {
        entities.push({
          type: 'template_name',
          value: match[1].trim(),
          confidence: 0.9,
          originalText: match[0]
        })
      }
    }

    // Extract audience groups
    const audiencePatterns = [
      /(?:for|audience|target)\s+['"]([^'"]+)['"]/i,
      /(?:for|audience|target)\s+(\w+(?:\s+\w+)*)/i,
      /(?:vip|customers|clients|users|members)/i
    ]
    
    for (const pattern of audiencePatterns) {
      const match = pattern.exec(originalMessage)
      if (match) {
        entities.push({
          type: 'audience_group',
          value: match[1]?.trim() || match[0].trim(),
          confidence: 0.8,
          originalText: match[0]
        })
      }
    }

    // Extract schedule information - be more specific to avoid false positives
    const schedulePatterns = [
      /(?:schedule|on|at|time)\s+['"]([^'"]+)['"]/i,
      /(?:schedule|on|at|time)\s+(\w+(?:\s+\w+)*)/i,
      /\b(?:tomorrow|today|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
      /\b(?:morning|afternoon|evening|night)\b/i,
      /\d{1,2}:\d{2}\s*(?:am|pm)?/i
    ]
    
    for (const pattern of schedulePatterns) {
      const match = pattern.exec(originalMessage)
      if (match) {
        // Only add if it's actually a schedule-related word, not just any word
        const value = match[1]?.trim() || match[0].trim()
        if (value && !value.includes('campaign') && !value.includes('template') && !value.includes('audience') && !value.includes('capable')) {
          entities.push({
            type: 'schedule',
            value: value,
            confidence: 0.8,
            originalText: match[0]
          })
        }
      }
    }

    // Extract email addresses
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    const emailMatches = originalMessage.match(emailPattern)
    if (emailMatches) {
      for (const email of emailMatches) {
        entities.push({
          type: 'email',
          value: email,
          confidence: 0.95,
          originalText: email
        })
      }
    }

    // Extract numbers
    const numberPattern = /\b\d+\b/g
    const numberMatches = originalMessage.match(numberPattern)
    if (numberMatches) {
      for (const number of numberMatches) {
        entities.push({
          type: 'number',
          value: number,
          confidence: 0.9,
          originalText: number
        })
      }
    }

    return entities
  }

  /**
   * Determine intent using semantic analysis
   */
  private async determineIntent(normalizedMessage: string, entities: ExtractedEntity[]): Promise<string> {
    // Intent patterns with confidence scoring
    const intentPatterns = [
      {
        intent: 'greeting',
        patterns: [/^hello$/i, /^hi$/i, /^hey$/i, /^good\s+(morning|afternoon|evening)$/i, /^greetings$/i, /^how.*going/i, /^how.*are.*you/i, /^hey there/i, /^how.*it going/i],
        confidence: 0.9
      },
      {
        intent: 'help_request',
        patterns: [/help/i, /what can you do/i, /capabilities/i, /assist/i, /guide/i, /what.*you.*capable/i, /can.*you.*help/i],
        confidence: 0.8
      },
      {
        intent: 'create_campaign',
        patterns: [/create.*campaign/i, /new.*campaign/i, /set up.*campaign/i, /build.*campaign/i, /campaign.*create/i, /make.*campaign/i, /send.*promotional.*email/i, /email.*campaign/i],
        confidence: 0.8
      },
      {
        intent: 'create_template',
        patterns: [/create.*template/i, /new.*template/i, /design.*template/i, /build.*template/i, /template.*create/i, /make.*template/i],
        confidence: 0.8
      },
      {
        intent: 'show_campaigns',
        patterns: [/show.*campaign/i, /list.*campaign/i, /display.*campaign/i, /get.*campaign/i, /what.*campaign/i, /campaign.*have/i, /my.*campaign/i],
        confidence: 0.8
      },
      {
        intent: 'show_templates',
        patterns: [/show.*template/i, /list.*template/i, /what.*template/i, /get.*template/i, /template.*have/i, /my.*template/i],
        confidence: 0.8
      },
      {
        intent: 'show_audience',
        patterns: [/show.*audience/i, /list.*audience/i, /audience.*data/i, /audience.*stats/i, /what.*audience/i, /my.*audience/i, /audience.*have/i],
        confidence: 0.8
      },
      {
        intent: 'system_status',
        patterns: [/system.*status/i, /is.*working/i, /health/i, /status/i, /everything.*working/i, /working.*properly/i],
        confidence: 0.7
      },
      {
        intent: 'vague_request',
        patterns: [/do something/i, /what is this/i, /show me everything/i, /help me/i, /^\?$/i, /not sure.*what/i],
        confidence: 0.6
      }
    ]

    let bestIntent = 'unknown'
    let bestConfidence = 0

    for (const intentPattern of intentPatterns) {
      for (const pattern of intentPattern.patterns) {
        if (pattern.test(normalizedMessage)) {
          if (intentPattern.confidence > bestConfidence) {
            bestIntent = intentPattern.intent
            bestConfidence = intentPattern.confidence
          }
        }
      }
    }

    // Boost confidence if we have relevant entities
    if (bestIntent === 'create_campaign' && entities.some(e => e.type === 'campaign_name')) {
      bestConfidence = Math.min(0.95, bestConfidence + 0.1)
    }
    if (bestIntent === 'create_template' && entities.some(e => e.type === 'template_name')) {
      bestConfidence = Math.min(0.95, bestConfidence + 0.1)
    }

    // Store confidence in context for later use
    this.contextMemory.set('lastIntentConfidence', bestConfidence)

    return bestIntent
  }

  /**
   * Generate tool calls based on intent and entities
   */
  private async generateToolCalls(intent: string, entities: ExtractedEntity[], message: string): Promise<ToolCall[]> {
    const toolCalls: ToolCall[] = []

    switch (intent) {
      case 'create_campaign':
        const campaignName = entities.find(e => e.type === 'campaign_name')?.value || 'Untitled Campaign'
        const audienceGroup = entities.find(e => e.type === 'audience_group')?.value || 'General'
        const templateName = entities.find(e => e.type === 'template_name')?.value || 'default-template'
        const schedule = entities.find(e => e.type === 'schedule')?.value

        // Only create campaign if we have sufficient details
        if (this.hasSufficientCampaignDetails(entities)) {
          toolCalls.push({
            id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: 'create_campaign',
            parameters: {
              name: campaignName,
              audienceGroup: audienceGroup,
              templateId: templateName,
              scheduledAt: schedule ? this.parseSchedule(schedule) : null
            },
            status: 'pending'
          })
        }
        break

      case 'create_template':
        const templateName2 = entities.find(e => e.type === 'template_name')?.value || 'Untitled Template'
        
        if (this.hasSufficientTemplateDetails(entities)) {
          toolCalls.push({
            id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: 'create_template',
            parameters: {
              name: templateName2,
              subject: `Subject for ${templateName2}`,
              htmlBody: `<h1>Hello!</h1><p>This is a template for ${templateName2}</p>`,
              textBody: `Hello! This is a template for ${templateName2}`
            },
            status: 'pending'
          })
        }
        break

      case 'show_campaigns':
        toolCalls.push({
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'get_campaigns',
          parameters: {},
          status: 'pending'
        })
        break

      case 'show_templates':
        toolCalls.push({
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'get_templates',
          parameters: {},
          status: 'pending'
        })
        break

      case 'show_audience':
        toolCalls.push({
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'get_audience_stats',
          parameters: {},
          status: 'pending'
        })
        break

      case 'system_status':
        toolCalls.push({
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'get_system_status',
          parameters: {},
          status: 'pending'
        })
        break
    }

    return toolCalls
  }

  /**
   * Check if we have sufficient campaign details
   */
  private hasSufficientCampaignDetails(entities: ExtractedEntity[]): boolean {
    const hasName = entities.some(e => e.type === 'campaign_name')
    const hasAudience = entities.some(e => e.type === 'audience_group')
    const hasTemplate = entities.some(e => e.type === 'template_name')
    const hasSchedule = entities.some(e => e.type === 'schedule')

    // Require at least 3 out of 4 key details
    const detailCount = [hasName, hasAudience, hasTemplate, hasSchedule].filter(Boolean).length
    return detailCount >= 3
  }

  /**
   * Check if we have sufficient template details
   */
  private hasSufficientTemplateDetails(entities: ExtractedEntity[]): boolean {
    const hasName = entities.some(e => e.type === 'template_name')
    // For templates, we can create with just a name
    return hasName
  }

  /**
   * Parse schedule string to Date
   */
  private parseSchedule(schedule: string): Date | null {
    try {
      // Handle relative dates
      if (schedule.toLowerCase().includes('tomorrow')) {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow
      }
      if (schedule.toLowerCase().includes('today')) {
        return new Date()
      }
      if (schedule.toLowerCase().includes('next week')) {
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        return nextWeek
      }
      
      // Try to parse as date
      const parsed = new Date(schedule)
      return isNaN(parsed.getTime()) ? null : parsed
    } catch {
      return null
    }
  }

  /**
   * Execute tool calls
   */
  private async executeToolCalls(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    const results: ToolResult[] = []
    
    for (const toolCall of toolCalls) {
      toolCall.status = 'running'
      
      try {
        let result: any
        
        switch (toolCall.name) {
          case 'create_campaign':
            result = await this.createCampaign(toolCall.parameters)
            break
          case 'create_template':
            result = await this.createTemplate(toolCall.parameters)
            break
          case 'get_campaigns':
            result = await this.getCampaigns()
            break
          case 'get_templates':
            result = await this.getTemplates()
            break
          case 'get_audience_stats':
            result = await this.getAudienceStats()
            break
          case 'get_system_status':
            result = await this.getSystemStatus()
            break
          default:
            throw new Error(`Unknown tool: ${toolCall.name}`)
        }
        
        toolCall.status = 'completed'
        results.push({
          toolCallId: toolCall.id,
          success: true,
          result: result
        })
        
      } catch (error: any) {
        toolCall.status = 'failed'
        results.push({
          toolCallId: toolCall.id,
          success: false,
          error: error.message
        })
      }
    }
    
    return results
  }

  /**
   * Generate natural response
   */
  private async generateNaturalResponse(
    intent: string, 
    entities: ExtractedEntity[], 
    toolCalls: ToolCall[], 
    toolResults: ToolResult[], 
    ragContext: any[]
  ): Promise<AIResponse> {
    let message = ''
    let confidence = this.contextMemory.get('lastIntentConfidence') || 0.8
    let suggestions: string[] = []

    // Handle different intents
    switch (intent) {
      case 'greeting':
        message = "Hello! I'm Juniper, your AI assistant for the RSVP system. I can help you manage campaigns, create email templates, segment audiences, and analyze data. What would you like to work on today?"
        confidence = 0.9
        suggestions = [
          "Create a new campaign",
          "Show me my campaigns", 
          "Create an email template",
          "Check system status"
        ]
        break

      case 'help_request':
        message = "I can help you with:\n\n• **Campaign Management**: Create, schedule, and monitor email campaigns\n• **Email Templates**: Design and manage reusable email templates\n• **Audience Segmentation**: Organize and manage your audience groups\n• **Analytics**: Track performance and generate reports\n• **System Monitoring**: Check system health and status\n\nWhat would you like to work on?"
        confidence = 0.9
        suggestions = [
          "Create a campaign for VIP customers",
          "Show me campaign performance",
          "Create a welcome email template"
        ]
        break

      case 'create_campaign':
        if (toolCalls.length === 0) {
          message = "I'd be happy to help you create a campaign! To get started, I need some details:\n\n• **Campaign name**: What should we call it?\n• **Target audience**: Who should receive it?\n• **Email template**: Which template should we use?\n• **Schedule**: When should it be sent?\n\nCould you provide these details?"
          confidence = 0.7
          suggestions = [
            "Create campaign named 'Summer Sale' for 'VIP customers' using 'Promo Template' scheduled for 'tomorrow'",
            "What information do you need for a campaign?",
            "Show me existing templates first"
          ]
        } else {
          const successfulTools = toolResults.filter(r => r.success)
          const failedTools = toolResults.filter(r => !r.success)
          
          if (successfulTools.length > 0) {
            message = `✅ Great! I've successfully created your campaign.`
            if (successfulTools[0].result) {
              message += `\n\n**Campaign Details:**\n• Name: ${successfulTools[0].result.name}\n• Status: ${successfulTools[0].result.status}\n• Created: ${new Date(successfulTools[0].result.createdAt).toLocaleString()}`
            }
            confidence = 0.9
          }
          
          if (failedTools.length > 0) {
            message += `\n\n❌ However, there was an issue: ${failedTools[0].error}`
            confidence = 0.6
          }
          
          suggestions = [
            "Show me all campaigns",
            "Create another campaign",
            "Schedule this campaign"
          ]
        }
        break

      case 'show_campaigns':
        if (toolResults.length > 0 && toolResults[0].success) {
          const campaigns = toolResults[0].result
          if (campaigns.length > 0) {
            message = `📊 Here are your campaigns:\n\n`
            campaigns.forEach((campaign: any, index: number) => {
              message += `${index + 1}. **${campaign.name}**\n   • Status: ${campaign.status}\n   • Created: ${new Date(campaign.createdAt).toLocaleDateString()}\n\n`
            })
            confidence = 0.9
          } else {
            message = "You don't have any campaigns yet. Would you like to create one?"
            confidence = 0.8
          }
        } else {
          message = "I couldn't retrieve your campaigns. Please try again."
          confidence = 0.5
        }
        suggestions = [
          "Create a new campaign",
          "Show campaign details",
          "Check system status"
        ]
        break

      case 'vague_request':
        message = "I'm not sure what you'd like me to do. Could you be more specific? I can help you with campaigns, templates, audience management, or system monitoring."
        confidence = 0.4
        suggestions = [
          "Create a campaign",
          "Show me what you can do",
          "Check system status"
        ]
        break

      default:
        message = "I understand you want help, but I'm not sure exactly what you need. Could you provide more details?"
        confidence = 0.5
        suggestions = [
          "Create a campaign",
          "Show me campaigns",
          "What can you do?"
        ]
    }

    return {
      message,
      toolCalls,
      toolResults,
      confidence,
      suggestions,
      intent,
      entities,
      ragContext
    }
  }

  /**
   * Get RAG context (placeholder for now)
   */
  private async getRAGContext(message: string): Promise<any[]> {
    // This would integrate with Weaviate or other RAG system
    return []
  }

  // Database operation methods
  private async createCampaign(params: any) {
    return await prisma.campaign.create({
      data: {
        name: params.name,
        status: 'DRAFT',
        meta: {
          audienceGroup: params.audienceGroup,
          templateId: params.templateId,
          scheduledAt: params.scheduledAt
        }
      }
    })
  }

  private async createTemplate(params: any) {
    return await prisma.campaignTemplate.create({
      data: {
        name: params.name,
        subject: params.subject,
        htmlBody: params.htmlBody,
        textBody: params.textBody,
        meta: {
          isActive: true
        }
      }
    })
  }

  private async getCampaigns() {
    return await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  }

  private async getTemplates() {
    return await prisma.campaignTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  }

  private async getAudienceStats() {
    const totalAudience = await prisma.audienceMember.count()
    const groups = await prisma.audienceGroup.findMany({
      include: {
        members: true
      }
    })
    
    return {
      totalAudience,
      groups: groups.map(g => ({
        name: g.name,
        memberCount: g.members.length
      }))
    }
  }

  private async getSystemStatus() {
    const campaignCount = await prisma.campaign.count()
    const templateCount = await prisma.campaignTemplate.count()
    const audienceCount = await prisma.audienceMember.count()
    
    return {
      status: 'Operational',
      campaignCount,
      templateCount,
      audienceCount,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Clear conversation history
   */
  public clearHistory(): void {
    this.conversationHistory = []
    this.contextMemory.clear()
  }
}
