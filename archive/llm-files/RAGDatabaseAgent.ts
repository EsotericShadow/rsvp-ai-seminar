/**
 * RAG-Powered Database Agent - Uses API routes for Weaviate access
 * This combines the pattern matching with RAG for better context
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

export interface AIResponse {
  message: string
  toolCalls: ToolCall[]
  toolResults?: ToolResult[]
  confidence: number
  suggestions: string[]
  intent?: string
  entities?: string[]
  ragContext?: any[]
}

const prisma = new PrismaClient()

export class RAGDatabaseAgent {
  private conversationHistory: ChatMessage[] = []

  /**
   * Process a user message with RAG-enhanced context
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
      // Step 1: Get RAG context from API
      const ragContext = await this.getRAGContext(userMessage)
      
      // Step 2: Determine which tools to use based on the message and context
      const toolCalls = this.determineToolCalls(userMessage, ragContext)
      
      // Step 3: Execute REAL tool calls
      const toolResults = await this.executeRealToolCalls(toolCalls)

      // Step 4: Generate response based on real results and RAG context
      const response = await this.generateRAGResponse(userMessage, toolCalls, toolResults, ragContext)

      // Add assistant response to conversation
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        toolCalls: toolCalls,
        toolResults: toolResults
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
   * Get RAG context from API route
   */
  private async getRAGContext(query: string): Promise<any[]> {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        const response = await fetch('/api/ai/rag', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, limit: 3 })
        })

        if (!response.ok) {
          console.warn('RAG API failed, falling back to pattern matching')
          return []
        }

        const data = await response.json()
        return data.context ? JSON.parse(data.context).knowledge || [] : []
      } else {
        // Server-side: use knowledge ingestion directly
        const { knowledgeIngestion } = await import('../weaviate/knowledgeIngestion')
        const knowledgeResults = await knowledgeIngestion.searchKnowledge(query, 3)
        return knowledgeResults
      }
    } catch (error) {
      console.warn('RAG context retrieval failed:', error)
      return []
    }
  }

  /**
   * Determine which tools to call based on user message and RAG context
   */
  private determineToolCalls(message: string, ragContext: any[]): ToolCall[] {
    const toolCalls: ToolCall[] = []
    const lowerMessage = message.toLowerCase()

    // Use RAG context to enhance intent recognition
    const contextKeywords = ragContext.map(item => 
      item.title?.toLowerCase() || item.content?.toLowerCase() || ''
    ).join(' ')

    const enhancedMessage = `${lowerMessage} ${contextKeywords}`

    // First, check for help/capability questions that should NOT execute tools
    if (this.isHelpOrCapabilityQuestion(message)) {
      return toolCalls // Return empty - let response handler provide guidance
    }

    // Check for greetings that should provide help
    if (this.isGreeting(message)) {
      return toolCalls // Return empty - let response handler provide guidance
    }

    // Campaign-related commands - require specific details
    if (enhancedMessage.includes('create') && enhancedMessage.includes('campaign')) {
      const params = this.extractCampaignParams(message)
      
      // Only create campaign if we have sufficient details
      if (this.hasSufficientCampaignDetails(message)) {
        toolCalls.push({
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'create_campaign',
          parameters: params,
          status: 'pending'
        })
      }
      // If not enough details, don't create tool calls - let the response handler ask for clarification
    } else if (enhancedMessage.includes('show') && enhancedMessage.includes('campaign')) {
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'get_campaigns',
        parameters: {},
        status: 'pending'
      })
    } else if (enhancedMessage.includes('list') && enhancedMessage.includes('campaign')) {
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'get_campaigns',
        parameters: {},
        status: 'pending'
      })
    } else if (enhancedMessage.includes('campaign') && enhancedMessage.includes('status')) {
      const campaignId = this.extractCampaignId(message)
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'get_campaign_status',
        parameters: { campaignId },
        status: 'pending'
      })
    } else if (enhancedMessage.includes('pause') && enhancedMessage.includes('campaign')) {
      const campaignId = this.extractCampaignId(message)
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'pause_campaign',
        parameters: { campaignId },
        status: 'pending'
      })
    } else if (enhancedMessage.includes('resume') && enhancedMessage.includes('campaign')) {
      const campaignId = this.extractCampaignId(message)
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'resume_campaign',
        parameters: { campaignId },
        status: 'pending'
      })
    } else if (enhancedMessage.includes('schedule') && enhancedMessage.includes('campaign')) {
      const params = this.extractScheduleParams(message)
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'schedule_campaign',
        parameters: params,
        status: 'pending'
      })
    } else if (enhancedMessage.includes('optimize') && enhancedMessage.includes('campaign')) {
      const campaignId = this.extractCampaignId(message)
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'optimize_campaign',
        parameters: { campaignId },
        status: 'pending'
      })
    }

    // Audience-related commands
    else if (enhancedMessage.includes('segment') && enhancedMessage.includes('audience')) {
      const criteria = this.extractAudienceCriteria(message)
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'segment_audience',
        parameters: { criteria },
        status: 'pending'
      })
    } else if (enhancedMessage.includes('audience') && enhancedMessage.includes('stats')) {
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'get_audience_stats',
        parameters: {},
        status: 'pending'
      })
    }

    // Template-related commands
    else if (enhancedMessage.includes('create') && enhancedMessage.includes('template')) {
      const params = this.extractTemplateParams(message)
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'create_template',
        parameters: params,
        status: 'pending'
      })
    } else if (enhancedMessage.includes('show') && enhancedMessage.includes('template')) {
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'get_templates',
        parameters: {},
        status: 'pending'
      })
    } else if (enhancedMessage.includes('template') && (enhancedMessage.includes('what') || enhancedMessage.includes('list') || enhancedMessage.includes('have'))) {
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'get_templates',
        parameters: {},
        status: 'pending'
      })
    } else if (enhancedMessage.includes('audience') && (enhancedMessage.includes('show') || enhancedMessage.includes('my'))) {
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'get_audience_stats',
        parameters: {},
        status: 'pending'
      })
    }

    // Template creation - require specific details
    if (enhancedMessage.includes('create') && enhancedMessage.includes('template')) {
      const params = this.extractTemplateParams(message)
      
      // Only create template if we have sufficient details
      if (this.hasSufficientTemplateDetails(message)) {
        toolCalls.push({
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'create_template',
          parameters: params,
          status: 'pending'
        })
      }
      // If not enough details, don't create tool calls - let the response handler ask for clarification
    }

    // System monitoring commands
    else if (enhancedMessage.includes('system') && enhancedMessage.includes('status')) {
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'get_system_status',
        parameters: {},
        status: 'pending'
      })
    }

    return toolCalls
  }

  /**
   * Execute real tool calls against the database
   */
  private async executeRealToolCalls(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    const results: ToolResult[] = []
    
    for (const toolCall of toolCalls) {
      toolCall.status = 'running'
      
      try {
        let result: any
        
        switch (toolCall.name) {
          case 'create_campaign':
            result = await this.createCampaign(toolCall.parameters)
            break
          case 'get_campaigns':
            result = await this.getCampaigns()
            break
          case 'get_campaign_status':
            result = await this.getCampaignStatus(toolCall.parameters.campaignId)
            break
          case 'pause_campaign':
            result = await this.pauseCampaign(toolCall.parameters.campaignId)
            break
          case 'resume_campaign':
            result = await this.resumeCampaign(toolCall.parameters.campaignId)
            break
          case 'schedule_campaign':
            result = await this.scheduleCampaign(toolCall.parameters)
            break
          case 'optimize_campaign':
            result = await this.optimizeCampaign(toolCall.parameters.campaignId)
            break
          case 'segment_audience':
            result = await this.segmentAudience(toolCall.parameters.criteria)
            break
          case 'get_audience_stats':
            result = await this.getAudienceStats()
            break
          case 'create_template':
            result = await this.createTemplate(toolCall.parameters)
            break
          case 'get_templates':
            result = await this.getTemplates()
            break
          case 'get_system_status':
            result = await this.getSystemStatus()
            break
          default:
            result = { message: 'Tool not implemented yet' }
        }
        
        toolCall.status = 'completed'
        results.push({
          toolCallId: toolCall.id,
          success: true,
          result: result
        })
      } catch (error) {
        toolCall.status = 'failed'
        results.push({
          toolCallId: toolCall.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return results
  }

  /**
   * Generate RAG-enhanced response
   */
  private async generateRAGResponse(
    userMessage: string, 
    toolCalls: ToolCall[], 
    toolResults: ToolResult[], 
    ragContext: any[]
  ): Promise<AIResponse> {
    let message = ''
    let confidence = 0.8
    const suggestions: string[] = []
    const lowerMessage = userMessage.toLowerCase()

    // Analyze confidence based on context and input quality
    confidence = this.calculateConfidence(userMessage, ragContext, toolCalls, toolResults)

    // Use RAG context to enhance the response
    if (ragContext.length > 0) {
      const relevantContext = ragContext[0]
      message += `Based on the system knowledge, `
      
      if (relevantContext.title) {
        message += `I found information about ${relevantContext.title}. `
      }
    } else {
      message += `I don't have specific context about this topic, so I'm working with general knowledge. `
    }

    // Handle uncertainty and ambiguity
    if (confidence < 0.5) {
      message += `⚠️ I'm not entirely certain about this request. `
      if (this.isAmbiguousRequest(userMessage)) {
        message += `Could you be more specific about what you'd like me to do? `
      } else if (this.needsMoreInformation(userMessage)) {
        message += `I need more details to help you properly. `
      }
    }

    // Handle help and capability questions
    if (this.isHelpOrCapabilityQuestion(userMessage)) {
      message += `I'm Juniper, your AI assistant for the RSVP system. I can help you with: `
      const capabilities = [
        'Creating and managing email campaigns',
        'Designing and editing email templates', 
        'Segmenting and managing audiences',
        'Scheduling and automating campaigns',
        'Analyzing campaign performance',
        'Managing system settings and workflows'
      ]
      message += capabilities.join(', ') + '. '
      
      if (userMessage.toLowerCase().includes('create') || userMessage.toLowerCase().includes('campaign')) {
        message += `To create a campaign, I need: campaign name, target audience, email template, and schedule. `
      }
      
      message += `What would you like to work on?`
      confidence = 0.9
    }
    // Handle specific campaign creation requests that lack details
    else if (userMessage.toLowerCase().includes('create') && userMessage.toLowerCase().includes('campaign') && toolCalls.length === 0) {
      message += `To create a campaign, I need more specific information. Please provide: `
      const missingDetails = []
      
      if (!userMessage.match(/(?:named?|called?|title)\s+['"]([^'"]+)['"]/i) && !userMessage.toLowerCase().includes('campaign named')) {
        missingDetails.push('campaign name (e.g., "named \'Summer Sale\'")')
      }
      if (!userMessage.match(/(?:for|audience|target)\s+['"]([^'"]+)['"]/i) && !userMessage.toLowerCase().includes('for ')) {
        missingDetails.push('target audience (e.g., "for \'VIP customers\'")')
      }
      if (!userMessage.match(/(?:using|template)\s+['"]([^'"]+)['"]/i) && !userMessage.toLowerCase().includes('using ')) {
        missingDetails.push('email template (e.g., "using \'Welcome Template\'")')
      }
      if (!userMessage.match(/(?:schedule|when|at|on)\s+['"]([^'"]+)['"]/i) && !userMessage.toLowerCase().includes('schedule')) {
        missingDetails.push('schedule (e.g., "scheduled for \'tomorrow\'")')
      }
      
      message += missingDetails.join(', ') + '.'
      confidence = 0.3
    }

    // Add tool execution results with quality assessment
    if (toolResults.length > 0) {
      const successfulResults = toolResults.filter(r => r.success)
      const failedResults = toolResults.filter(r => !r.success)
      
      if (successfulResults.length > 0) {
        message += `✅ I've successfully executed ${successfulResults.length} operation(s). `
        
        // Validate result quality
        const qualityIssues = this.validateResultQuality(successfulResults)
        if (qualityIssues.length > 0) {
          message += `However, I noticed some potential issues: ${qualityIssues.join(', ')}. `
          confidence = Math.min(confidence, 0.7)
        }
      }
      
      if (failedResults.length > 0) {
        message += `❌ ${failedResults.length} operation(s) failed. `
        confidence = Math.min(confidence, 0.6)
        
        // Analyze failure reasons
        const failureReasons = failedResults.map(r => r.error).filter(Boolean)
        if (failureReasons.length > 0) {
          message += `The main issues were: ${failureReasons.slice(0, 2).join(', ')}. `
        }
      }
    } else if (toolCalls.length === 0) {
      if (confidence < 0.5) {
        message += `I'm not sure how to help with this. Could you rephrase your request or provide more specific details? `
      } else {
        message += "I understand your request but no specific actions were taken. "
      }
    }

    // Add context-specific suggestions based on RAG and confidence
    if (ragContext.some(ctx => ctx.category === 'campaign')) {
      suggestions.push('Create a new campaign', 'View campaign analytics', 'Schedule a campaign')
    }
    if (ragContext.some(ctx => ctx.category === 'template')) {
      suggestions.push('Create email template', 'Edit template', 'Test template')
    }
    if (ragContext.some(ctx => ctx.category === 'audience')) {
      suggestions.push('Segment audience', 'Import audience data', 'Export audience')
    }

    // Add uncertainty-based suggestions
    if (confidence < 0.7) {
      suggestions.push('Could you provide more details?', 'Try rephrasing your request', 'Ask about specific features')
    }

    // Add confidence indicator
    if (confidence < 0.8) {
      message += `\n\n💭 Confidence: ${Math.round(confidence * 100)}% - Please let me know if this isn't what you were looking for.`
    }

    return {
      message: message.trim(),
      toolCalls,
      toolResults,
      confidence,
      suggestions,
      ragContext
    }
  }

  private calculateConfidence(userMessage: string, ragContext: any[], toolCalls: ToolCall[], toolResults: ToolResult[]): number {
    let confidence = 0.8

    // Reduce confidence for ambiguous requests
    if (this.isAmbiguousRequest(userMessage)) {
      confidence -= 0.3
    }

    // Reduce confidence for vague requests
    if (this.needsMoreInformation(userMessage)) {
      confidence -= 0.4
    }

    // Adjust based on RAG context quality
    if (ragContext.length === 0) {
      confidence -= 0.2
    } else if (ragContext.length < 2) {
      confidence -= 0.1
    }

    // Adjust based on tool execution results
    if (toolResults.length > 0) {
      const successRate = toolResults.filter(r => r.success).length / toolResults.length
      confidence = (confidence + successRate) / 2
    }

    // Ensure confidence is between 0 and 1
    return Math.max(0.1, Math.min(1.0, confidence))
  }

  private isAmbiguousRequest(message: string): boolean {
    const ambiguousPatterns = [
      /^(help|what|how|can you)/i,
      /^(show|display|list)/i,
      /^(create|make|build)/i,
      /^(delete|remove|clear)/i
    ]
    
    return ambiguousPatterns.some(pattern => pattern.test(message.trim())) && 
           message.split(' ').length < 4
  }

  private needsMoreInformation(message: string): boolean {
    const vaguePatterns = [
      /^(do|can|will|should)/i,
      /^(it|this|that)/i,
      /^(something|anything|everything)/i
    ]
    
    return vaguePatterns.some(pattern => pattern.test(message.trim())) && 
           message.split(' ').length < 3
  }

  private validateResultQuality(results: ToolResult[]): string[] {
    const issues: string[] = []
    
    results.forEach(result => {
      if (result.result) {
        // Check for empty or minimal results
        if (typeof result.result === 'object' && Object.keys(result.result).length === 0) {
          issues.push('empty results')
        }
        
        // Check for error-like patterns in results
        if (typeof result.result === 'string' && result.result.toLowerCase().includes('error')) {
          issues.push('potential errors in results')
        }
      }
    })
    
    return issues
  }

  private hasSufficientCampaignDetails(message: string): boolean {
    const lowerMessage = message.toLowerCase()
    
    // Check for campaign name - more flexible patterns
    const hasName = /(?:named?|called?|title)\s+['"]([^'"]+)['"]/i.test(message) ||
                   /(?:named?|called?|title)\s+(\w+)/i.test(message) ||
                   lowerMessage.includes('campaign named') ||
                   lowerMessage.includes('campaign called') ||
                   lowerMessage.includes('campaign for') ||
                   lowerMessage.includes('campaign with')
    
    // Check for audience/target - more flexible patterns
    const hasAudience = /(?:for|audience|target)\s+['"]([^'"]+)['"]/i.test(message) ||
                       /(?:for|audience|target)\s+(\w+)/i.test(message) ||
                       lowerMessage.includes('for ') ||
                       lowerMessage.includes('audience') ||
                       lowerMessage.includes('industry') ||
                       lowerMessage.includes('customers') ||
                       lowerMessage.includes('clients')
    
    // Check for template - more flexible patterns
    const hasTemplate = /(?:using|template)\s+['"]([^'"]+)['"]/i.test(message) ||
                       /(?:using|template)\s+(\w+)/i.test(message) ||
                       lowerMessage.includes('using ') ||
                       lowerMessage.includes('template') ||
                       lowerMessage.includes('subject line') ||
                       lowerMessage.includes('email content')
    
    // Check for schedule - more flexible patterns
    const hasSchedule = /(?:schedule|when|at|on)\s+['"]([^'"]+)['"]/i.test(message) ||
                       /(?:schedule|when|at|on)\s+(\w+)/i.test(message) ||
                       lowerMessage.includes('schedule') ||
                       lowerMessage.includes('tomorrow') ||
                       lowerMessage.includes('monday') ||
                       lowerMessage.includes('tuesday') ||
                       lowerMessage.includes('wednesday') ||
                       lowerMessage.includes('thursday') ||
                       lowerMessage.includes('friday') ||
                       lowerMessage.includes('saturday') ||
                       lowerMessage.includes('sunday') ||
                       lowerMessage.includes('next ') ||
                       lowerMessage.includes('at ') ||
                       lowerMessage.includes('9 am') ||
                       lowerMessage.includes('10 am') ||
                       lowerMessage.includes('11 am') ||
                       lowerMessage.includes('12 pm') ||
                       lowerMessage.includes('1 pm') ||
                       lowerMessage.includes('2 pm') ||
                       lowerMessage.includes('3 pm') ||
                       lowerMessage.includes('4 pm') ||
                       lowerMessage.includes('5 pm')
    
    // Require ALL 4 key details for campaign creation
    const detailCount = [hasName, hasAudience, hasTemplate, hasSchedule].filter(Boolean).length
    
    // Also check if this is a help request disguised as a creation request
    const isHelpRequest = /(?:can\s+you\s+help|help\s+me|how\s+do\s+i)/i.test(message)
    
    return detailCount >= 4 && !isHelpRequest
  }

  private isHelpOrCapabilityQuestion(message: string): boolean {
    const lowerMessage = message.toLowerCase()
    
    // Help questions
    const helpPatterns = [
      /^help\s*$/i,
      /^help\s+(?:me\s+)?(?:with\s+)?/i,
      /^can\s+you\s+help/i,
      /^how\s+do\s+i/i,
      /^what\s+can\s+you\s+do/i,
      /^what\s+are\s+your\s+capabilities/i,
      /^what\s+do\s+you\s+do/i
    ]
    
    // Capability questions
    const capabilityPatterns = [
      /^what\s+can\s+you/i,
      /^what\s+do\s+you\s+do/i,
      /^what\s+are\s+your\s+features/i,
      /^what\s+are\s+your\s+capabilities/i,
      /^tell\s+me\s+about\s+your\s+features/i
    ]
    
    // Partial help requests that should ask for clarification
    const partialHelpPatterns = [
      /^help\s+me\s+create/i,
      /^can\s+you\s+help\s+me\s+create/i,
      /^how\s+do\s+i\s+create/i,
      /^i\s+want\s+to\s+create.*can\s+you\s+help/i,
      /^i\s+want\s+to\s+create.*help/i
    ]
    
    return helpPatterns.some(pattern => pattern.test(message)) ||
           capabilityPatterns.some(pattern => pattern.test(message)) ||
           partialHelpPatterns.some(pattern => pattern.test(message))
  }

  private isGreeting(message: string): boolean {
    const lowerMessage = message.toLowerCase().trim()
    const greetingPatterns = [
      /^hello$/i,
      /^hi$/i,
      /^hey$/i,
      /^good\s+(morning|afternoon|evening)$/i,
      /^greetings$/i
    ]
    
    return greetingPatterns.some(pattern => pattern.test(lowerMessage))
  }

  private hasSufficientTemplateDetails(message: string): boolean {
    const lowerMessage = message.toLowerCase()
    
    // Check for template name
    const hasName = /(?:named?|called?|title)\s+['"]([^'"]+)['"]/i.test(message) ||
                   /(?:named?|called?|title)\s+(\w+)/i.test(message) ||
                   lowerMessage.includes('template named') ||
                   lowerMessage.includes('template called')
    
    // Check for subject
    const hasSubject = /(?:subject)\s+['"]([^'"]+)['"]/i.test(message) ||
                      /(?:subject)\s+(\w+)/i.test(message) ||
                      lowerMessage.includes('subject')
    
    // Check for content
    const hasContent = /(?:content|body)\s+['"]([^'"]+)['"]/i.test(message) ||
                      /(?:content|body)\s+(\w+)/i.test(message) ||
                      lowerMessage.includes('content') ||
                      lowerMessage.includes('body')
    
    // Require at least 2 out of 3 key details
    const detailCount = [hasName, hasSubject, hasContent].filter(Boolean).length
    return detailCount >= 2
  }

  // Database operation methods (same as RealDatabaseAgent)
  private async createCampaign(params: any) {
    const campaign = await prisma.campaign.create({
      data: {
        name: params.name || 'New Campaign',
        status: 'DRAFT',
        meta: {
          audienceGroup: params.audienceGroup || 'General',
          templateId: params.templateId || null,
          scheduledAt: params.scheduledAt || null
        }
      }
    })
    return { campaign, message: 'Campaign created successfully' }
  }

  private async getCampaigns() {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    return { campaigns, count: campaigns.length }
  }

  private async getCampaignStatus(campaignId: string) {
    if (!campaignId) {
      throw new Error('Campaign ID is required')
    }
    
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    })
    
    if (!campaign) {
      throw new Error('Campaign not found')
    }
    
    return { campaign, status: campaign.status }
  }

  private async pauseCampaign(campaignId: string) {
    if (!campaignId) {
      throw new Error('Campaign ID is required')
    }
    
    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'PAUSED' }
    })
    
    return { campaign, message: 'Campaign paused successfully' }
  }

  private async resumeCampaign(campaignId: string) {
    if (!campaignId) {
      throw new Error('Campaign ID is required')
    }
    
    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'SENDING' }
    })
    
    return { campaign, message: 'Campaign resumed successfully' }
  }

  private async scheduleCampaign(params: any) {
    const campaign = await prisma.campaign.update({
      where: { id: params.campaignId },
      data: { 
        status: 'SCHEDULED',
        meta: {
          ...params.meta,
          scheduledAt: params.scheduledAt
        }
      }
    })
    
    return { campaign, message: 'Campaign scheduled successfully' }
  }

  private async optimizeCampaign(campaignId: string) {
    // Simulate optimization analysis
    return { 
      message: 'Campaign optimization analysis completed',
      recommendations: [
        'Consider A/B testing subject lines',
        'Optimize send times based on audience behavior',
        'Segment audience for better targeting'
      ]
    }
  }

  private async segmentAudience(criteria: string) {
    const members = await prisma.audienceMember.findMany({
      where: {
        businessName: {
          contains: criteria,
          mode: 'insensitive'
        }
      },
      take: 10
    })
    
    return { members, count: members.length, criteria }
  }

  private async getAudienceStats() {
    const totalMembers = await prisma.audienceMember.count()
    const groups = await prisma.audienceGroup.findMany()
    
    return { 
      totalMembers, 
      totalGroups: groups.length,
      groups: groups.map(g => ({ name: g.name, count: 0 })) // Simplified
    }
  }

  private async createTemplate(params: any) {
    const template = await prisma.campaignTemplate.create({
      data: {
        name: params.name || 'New Template',
        subject: params.subject || 'Email Subject',
        htmlBody: params.htmlBody || '<p>Email content</p>',
        textBody: params.textBody || 'Email content',
        meta: {
          audienceGroup: params.audienceGroup || 'General',
          isActive: true
        }
      }
    })
    
    return { template, message: 'Template created successfully' }
  }

  private async getTemplates() {
    const templates = await prisma.campaignTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    return { templates, count: templates.length }
  }

  private async getSystemStatus() {
    const campaigns = await prisma.campaign.count()
    const templates = await prisma.campaignTemplate.count()
    const members = await prisma.audienceMember.count()
    
    return {
      campaigns,
      templates,
      members,
      status: 'healthy',
      message: 'System is running normally'
    }
  }

  // Helper methods
  private extractCampaignParams(message: string): any {
    const params: any = {}
    
    const nameMatch = message.match(/campaign[:\s]+(.+?)(?:\s|$)/i)
    if (nameMatch) {
      params.name = nameMatch[1]
    }
    
    return params
  }

  private extractCampaignId(message: string): string | null {
    const idMatch = message.match(/campaign[:\s]+([a-zA-Z0-9-]+)/i)
    return idMatch ? idMatch[1] : null
  }

  private extractScheduleParams(message: string): any {
    const params: any = {}
    
    const dateMatch = message.match(/schedule[:\s]+(.+?)(?:\s|$)/i)
    if (dateMatch) {
      params.scheduledAt = new Date(dateMatch[1])
    }
    
    return params
  }

  private extractAudienceCriteria(message: string): string {
    const criteriaMatch = message.match(/segment[:\s]+(.+?)(?:\s|$)/i)
    return criteriaMatch ? criteriaMatch[1] : 'general'
  }

  private extractTemplateParams(message: string): any {
    const params: any = {}
    
    const nameMatch = message.match(/template[:\s]+(.+?)(?:\s|$)/i)
    if (nameMatch) {
      params.name = nameMatch[1]
    }
    
    return params
  }
}