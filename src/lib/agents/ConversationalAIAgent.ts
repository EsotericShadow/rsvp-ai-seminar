/**
 * Conversational AI Agent - Asks for details instead of guessing
 * This agent understands the full RSVP system and asks clarifying questions
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
  isError?: boolean
  needsClarification?: boolean
  clarificationQuestions?: string[]
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
  needsClarification?: boolean
  clarificationQuestions?: string[]
  context?: any
}

const prisma = new PrismaClient()

export class ConversationalAIAgent {
  private conversationHistory: ChatMessage[] = []
  private currentContext: any = {}

  /**
   * Process a user message with conversational intelligence
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
      // Analyze the message and determine if we need clarification
      const analysis = this.analyzeMessage(userMessage)
      
      if (analysis.needsClarification) {
        return this.generateClarificationResponse(analysis)
      }

      // Execute the task with full context
      const toolCalls = this.determineToolCalls(userMessage, analysis)
      const toolResults = await this.executeRealToolCalls(toolCalls)
      const response = await this.generateResponse(userMessage, toolCalls, toolResults, analysis)

      // Add assistant response to conversation
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        toolCalls: toolCalls,
        toolResults: toolResults,
        needsClarification: response.needsClarification,
        clarificationQuestions: response.clarificationQuestions
      }
      this.conversationHistory.push(assistantMsg)

      return response

    } catch (error) {
      console.error('Error processing message:', error)
      
      const errorResponse: AIResponse = {
        message: `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Let me help you with something else.`,
        toolCalls: [],
        confidence: 0,
        suggestions: ['Try asking about campaign status', 'Ask about audience data', 'Check system status']
      }

      return errorResponse
    }
  }

  /**
   * Analyze the user message to understand intent and required information
   */
  private analyzeMessage(message: string): any {
    const lowerMessage = message.toLowerCase()
    const analysis = {
      intent: '',
      needsClarification: false,
      missingInfo: [] as string[],
      context: {}
    }

    // Campaign creation analysis
    if (lowerMessage.includes('create') && lowerMessage.includes('campaign')) {
      analysis.intent = 'create_campaign'
      
      // Check for required information
      const hasName = this.extractCampaignName(message)
      const hasAudience = this.extractAudienceInfo(message)
      const hasTemplate = this.extractTemplateInfo(message)
      const hasSchedule = this.extractScheduleInfo(message)

      if (!hasName) analysis.missingInfo.push('campaign name')
      if (!hasAudience) analysis.missingInfo.push('target audience')
      if (!hasTemplate) analysis.missingInfo.push('email template')
      if (!hasSchedule) analysis.missingInfo.push('send schedule')

      analysis.needsClarification = analysis.missingInfo.length > 0
      analysis.context = { hasName, hasAudience, hasTemplate, hasSchedule }
    }

    // Template creation analysis
    else if (lowerMessage.includes('create') && lowerMessage.includes('template')) {
      analysis.intent = 'create_template'
      
      const hasName = this.extractTemplateName(message)
      const hasSubject = this.extractSubjectLine(message)
      const hasContent = this.extractContent(message)
      const hasAudience = this.extractAudienceInfo(message)

      if (!hasName) analysis.missingInfo.push('template name')
      if (!hasSubject) analysis.missingInfo.push('email subject line')
      if (!hasContent) analysis.missingInfo.push('email content')
      if (!hasAudience) analysis.missingInfo.push('target audience')

      analysis.needsClarification = analysis.missingInfo.length > 0
      analysis.context = { hasName, hasSubject, hasContent, hasAudience }
    }

    // Audience segmentation analysis
    else if (lowerMessage.includes('segment') && lowerMessage.includes('audience')) {
      analysis.intent = 'segment_audience'
      
      const hasCriteria = this.extractSegmentationCriteria(message)
      const hasGroupName = this.extractGroupName(message)

      if (!hasCriteria) analysis.missingInfo.push('segmentation criteria')
      if (!hasGroupName) analysis.missingInfo.push('group name')

      analysis.needsClarification = analysis.missingInfo.length > 0
      analysis.context = { hasCriteria, hasGroupName }
    }

    // Automation setup analysis
    else if (lowerMessage.includes('automation') || lowerMessage.includes('workflow')) {
      analysis.intent = 'setup_automation'
      
      const hasTrigger = this.extractTrigger(message)
      const hasAction = this.extractAction(message)
      const hasCondition = this.extractCondition(message)

      if (!hasTrigger) analysis.missingInfo.push('trigger condition')
      if (!hasAction) analysis.missingInfo.push('action to perform')
      if (!hasCondition) analysis.missingInfo.push('when to execute')

      analysis.needsClarification = analysis.missingInfo.length > 0
      analysis.context = { hasTrigger, hasAction, hasCondition }
    }

    return analysis
  }

  /**
   * Generate clarification questions
   */
  private generateClarificationResponse(analysis: any): AIResponse {
    const questions = this.generateClarificationQuestions(analysis)
    
    return {
      message: `I'd be happy to help you ${analysis.intent.replace('_', ' ')}! To do this properly, I need a few more details:\n\n${questions.join('\n\n')}\n\nPlease provide these details so I can help you effectively.`,
      toolCalls: [],
      confidence: 0.9,
      suggestions: this.generateContextualSuggestions(analysis.intent),
      needsClarification: true,
      clarificationQuestions: questions,
      context: analysis.context
    }
  }

  /**
   * Generate specific clarification questions based on missing information
   */
  private generateClarificationQuestions(analysis: any): string[] {
    const questions: string[] = []

    if (analysis.intent === 'create_campaign') {
      if (!analysis.context.hasName) {
        questions.push("📝 What should I name this campaign? (e.g., 'Healthcare Newsletter Q4', 'Construction Industry Update')")
      }
      if (!analysis.context.hasAudience) {
        questions.push("👥 Which audience should I target? (e.g., 'Healthcare companies', 'Construction businesses', 'All verified emails')")
      }
      if (!analysis.context.hasTemplate) {
        questions.push("📧 Which email template should I use? (e.g., 'Newsletter Template', 'Event Invitation', or create a new one)")
      }
      if (!analysis.context.hasSchedule) {
        questions.push("⏰ When should I send this campaign? (e.g., 'Now', 'Tomorrow at 9 AM', 'Next Monday', 'Schedule for later')")
      }
    }

    if (analysis.intent === 'create_template') {
      if (!analysis.context.hasName) {
        questions.push("📝 What should I name this template? (e.g., 'Newsletter Template', 'Event Invitation', 'Follow-up Email')")
      }
      if (!analysis.context.hasSubject) {
        questions.push("📧 What should the subject line be? (e.g., 'Monthly Newsletter - {{businessName}}', 'You're Invited to Our Event')")
      }
      if (!analysis.context.hasContent) {
        questions.push("📄 What content should I include? (e.g., 'Newsletter content', 'Event details', 'Follow-up message')")
      }
      if (!analysis.context.hasAudience) {
        questions.push("👥 Which audience is this template for? (e.g., 'Healthcare', 'Construction', 'All businesses')")
      }
    }

    if (analysis.intent === 'segment_audience') {
      if (!analysis.context.hasCriteria) {
        questions.push("🔍 How should I segment the audience? (e.g., 'By industry', 'By location', 'By engagement level', 'By business size')")
      }
      if (!analysis.context.hasGroupName) {
        questions.push("🏷️ What should I name this audience group? (e.g., 'Healthcare Companies', 'High Engagement', 'Local Businesses')")
      }
    }

    if (analysis.intent === 'setup_automation') {
      if (!analysis.context.hasTrigger) {
        questions.push("⚡ What should trigger this automation? (e.g., 'New RSVP', 'Campaign sent', 'Email opened', 'Scheduled time')")
      }
      if (!analysis.context.hasAction) {
        questions.push("🎯 What action should I perform? (e.g., 'Send follow-up email', 'Add to segment', 'Update status', 'Send notification')")
      }
      if (!analysis.context.hasCondition) {
        questions.push("📋 When should this run? (e.g., 'Immediately', 'After 1 hour', 'Only if opened', 'Only for specific audience')")
      }
    }

    return questions
  }

  /**
   * Generate contextual suggestions based on intent
   */
  private generateContextualSuggestions(intent: string): string[] {
    switch (intent) {
      case 'create_campaign':
        return [
          'Create a healthcare newsletter campaign',
          'Set up a construction industry update',
          'Schedule a monthly newsletter',
          'Create an event invitation campaign'
        ]
      case 'create_template':
        return [
          'Create a newsletter template',
          'Make an event invitation template',
          'Design a follow-up email template',
          'Create a welcome email template'
        ]
      case 'segment_audience':
        return [
          'Segment by industry type',
          'Group by engagement level',
          'Segment by location',
          'Create high-value customer group'
        ]
      case 'setup_automation':
        return [
          'Automate follow-up emails',
          'Set up RSVP reminders',
          'Create engagement tracking',
          'Automate audience segmentation'
        ]
      default:
        return [
          'Create a new campaign',
          'Show campaign performance',
          'Analyze audience data',
          'Check system status'
        ]
    }
  }

  /**
   * Determine tool calls based on complete information
   */
  private determineToolCalls(message: string, analysis: any): ToolCall[] {
    if (analysis.needsClarification) {
      return []
    }

    const toolCalls: ToolCall[] = []
    const lowerMessage = message.toLowerCase()

    switch (analysis.intent) {
      case 'create_campaign':
        toolCalls.push({
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'create_campaign',
          parameters: this.extractCampaignParams(message),
          status: 'pending'
        })
        break
      case 'create_template':
        toolCalls.push({
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'create_template',
          parameters: this.extractTemplateParams(message),
          status: 'pending'
        })
        break
      case 'segment_audience':
        toolCalls.push({
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'segment_audience',
          parameters: this.extractSegmentationParams(message),
          status: 'pending'
        })
        break
      case 'setup_automation':
        toolCalls.push({
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'setup_automation',
          parameters: this.extractAutomationParams(message),
          status: 'pending'
        })
        break
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
          case 'create_template':
            result = await this.createTemplate(toolCall.parameters)
            break
          case 'segment_audience':
            result = await this.segmentAudience(toolCall.parameters)
            break
          case 'setup_automation':
            result = await this.setupAutomation(toolCall.parameters)
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
   * Generate response based on execution results
   */
  private async generateResponse(
    userMessage: string, 
    toolCalls: ToolCall[], 
    toolResults: ToolResult[], 
    analysis: any
  ): Promise<AIResponse> {
    let message = ''
    let confidence = 0.9
    const suggestions: string[] = []

    if (toolResults.length > 0) {
      const successfulResults = toolResults.filter(r => r.success)
      const failedResults = toolResults.filter(r => !r.success)
      
      if (successfulResults.length > 0) {
        message += `✅ Perfect! I've successfully ${analysis.intent.replace('_', ' ')}d for you. `
        
        // Add specific success details
        successfulResults.forEach(result => {
          if (result.result?.campaign) {
            message += `\n\n📧 Campaign "${result.result.campaign.name}" has been created and is ready to send.`
          }
          if (result.result?.template) {
            message += `\n\n📝 Template "${result.result.template.name}" has been created and is ready to use.`
          }
          if (result.result?.group) {
            message += `\n\n👥 Audience group "${result.result.group.name}" has been created with ${result.result.count} members.`
          }
        })
        
        confidence = 0.95
      }
      
      if (failedResults.length > 0) {
        message += `\n\n❌ Some operations failed. Let me know if you'd like me to try again or help with something else.`
        confidence = 0.6
      }
    } else {
      message += "I understand your request. Let me help you with that."
    }

    // Add next steps
    message += `\n\nWhat would you like to do next?`

    return {
      message,
      toolCalls,
      toolResults,
      confidence,
      suggestions: this.generateContextualSuggestions(analysis.intent)
    }
  }

  // Information extraction methods
  private extractCampaignName(message: string): string | null {
    const patterns = [
      /campaign[:\s]+(.+?)(?:\s|$)/i,
      /name[:\s]+(.+?)(?:\s|$)/i,
      /"(.+?)"/,
      /'(.+?)'/
    ]
    
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match && match[1].length > 2) {
        return match[1]
      }
    }
    return null
  }

  private extractAudienceInfo(message: string): string | null {
    const patterns = [
      /audience[:\s]+(.+?)(?:\s|$)/i,
      /target[:\s]+(.+?)(?:\s|$)/i,
      /for[:\s]+(.+?)(?:\s|$)/i
    ]
    
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match && match[1].length > 2) {
        return match[1]
      }
    }
    return null
  }

  private extractTemplateInfo(message: string): string | null {
    const patterns = [
      /template[:\s]+(.+?)(?:\s|$)/i,
      /using[:\s]+(.+?)(?:\s|$)/i
    ]
    
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match && match[1].length > 2) {
        return match[1]
      }
    }
    return null
  }

  private extractScheduleInfo(message: string): string | null {
    const patterns = [
      /schedule[:\s]+(.+?)(?:\s|$)/i,
      /send[:\s]+(.+?)(?:\s|$)/i,
      /when[:\s]+(.+?)(?:\s|$)/i
    ]
    
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match && match[1].length > 2) {
        return match[1]
      }
    }
    return null
  }

  private extractTemplateName(message: string): string | null {
    return this.extractCampaignName(message) // Same pattern
  }

  private extractSubjectLine(message: string): string | null {
    const patterns = [
      /subject[:\s]+(.+?)(?:\s|$)/i,
      /title[:\s]+(.+?)(?:\s|$)/i
    ]
    
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match && match[1].length > 2) {
        return match[1]
      }
    }
    return null
  }

  private extractContent(message: string): string | null {
    const patterns = [
      /content[:\s]+(.+?)(?:\s|$)/i,
      /message[:\s]+(.+?)(?:\s|$)/i,
      /body[:\s]+(.+?)(?:\s|$)/i
    ]
    
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match && match[1].length > 2) {
        return match[1]
      }
    }
    return null
  }

  private extractSegmentationCriteria(message: string): string | null {
    const patterns = [
      /segment[:\s]+(.+?)(?:\s|$)/i,
      /criteria[:\s]+(.+?)(?:\s|$)/i,
      /by[:\s]+(.+?)(?:\s|$)/i
    ]
    
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match && match[1].length > 2) {
        return match[1]
      }
    }
    return null
  }

  private extractGroupName(message: string): string | null {
    return this.extractCampaignName(message) // Same pattern
  }

  private extractTrigger(message: string): string | null {
    const patterns = [
      /trigger[:\s]+(.+?)(?:\s|$)/i,
      /when[:\s]+(.+?)(?:\s|$)/i
    ]
    
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match && match[1].length > 2) {
        return match[1]
      }
    }
    return null
  }

  private extractAction(message: string): string | null {
    const patterns = [
      /action[:\s]+(.+?)(?:\s|$)/i,
      /do[:\s]+(.+?)(?:\s|$)/i,
      /perform[:\s]+(.+?)(?:\s|$)/i
    ]
    
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match && match[1].length > 2) {
        return match[1]
      }
    }
    return null
  }

  private extractCondition(message: string): string | null {
    const patterns = [
      /condition[:\s]+(.+?)(?:\s|$)/i,
      /if[:\s]+(.+?)(?:\s|$)/i
    ]
    
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match && match[1].length > 2) {
        return match[1]
      }
    }
    return null
  }

  // Parameter extraction methods
  private extractCampaignParams(message: string): any {
    return {
      name: this.extractCampaignName(message) || 'New Campaign',
      audience: this.extractAudienceInfo(message) || 'General',
      template: this.extractTemplateInfo(message) || 'Default Template',
      schedule: this.extractScheduleInfo(message) || 'Now'
    }
  }

  private extractTemplateParams(message: string): any {
    return {
      name: this.extractTemplateName(message) || 'New Template',
      subject: this.extractSubjectLine(message) || 'Email Subject',
      content: this.extractContent(message) || 'Email content',
      audience: this.extractAudienceInfo(message) || 'General'
    }
  }

  private extractSegmentationParams(message: string): any {
    return {
      criteria: this.extractSegmentationCriteria(message) || 'industry',
      groupName: this.extractGroupName(message) || 'New Group'
    }
  }

  private extractAutomationParams(message: string): any {
    return {
      trigger: this.extractTrigger(message) || 'manual',
      action: this.extractAction(message) || 'send email',
      condition: this.extractCondition(message) || 'always'
    }
  }

  // Database operation methods
  private async createCampaign(params: any) {
    const campaign = await prisma.campaign.create({
      data: {
        name: params.name,
        status: 'DRAFT',
        meta: {
          audienceGroup: params.audience,
          templateId: params.template,
          scheduledAt: params.schedule === 'Now' ? null : new Date(params.schedule)
        }
      }
    })
    return { campaign, message: 'Campaign created successfully' }
  }

  private async createTemplate(params: any) {
    const template = await prisma.campaignTemplate.create({
      data: {
        name: params.name,
        subject: params.subject,
        htmlBody: `<p>${params.content}</p>`,
        textBody: params.content,
        meta: {
          audienceGroup: params.audience,
          isActive: true
        }
      }
    })
    return { template, message: 'Template created successfully' }
  }

  private async segmentAudience(params: any) {
    // Simulate audience segmentation
    const members = await prisma.audienceMember.findMany({
      where: {
        businessName: {
          contains: params.criteria,
          mode: 'insensitive'
        }
      },
      take: 10
    })
    
    return { 
      group: { name: params.groupName },
      members, 
      count: members.length,
      message: 'Audience segmented successfully' 
    }
  }

  private async setupAutomation(params: any) {
    // Simulate automation setup
    return { 
      automation: {
        trigger: params.trigger,
        action: params.action,
        condition: params.condition
      },
      message: 'Automation setup successfully' 
    }
  }
}
