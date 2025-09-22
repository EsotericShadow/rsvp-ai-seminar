/**
 * Personal AI Agent - Your personal assistant that can execute real commands
 * This is like having me as a tool that can actually do things in your RSVP system
 */

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  toolCalls?: ToolCall[]
  toolResults?: ToolResult[]
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
  confidence: number
  suggestions: string[]
}

export class PersonalAIAgent {
  private conversationHistory: ChatMessage[] = []
  private availableTools: Map<string, ToolFunction> = new Map()

  constructor() {
    this.initializeTools()
  }

  /**
   * Initialize available tools that the AI can use
   */
  private initializeTools(): void {
    // Campaign Management Tools
    this.availableTools.set('create_campaign', {
      name: 'create_campaign',
      description: 'Create a new email campaign',
      parameters: {
        name: { type: 'string', required: true, description: 'Campaign name' },
        description: { type: 'string', required: false, description: 'Campaign description' },
        audience: { type: 'string', required: true, description: 'Target audience group' },
        template: { type: 'string', required: false, description: 'Email template to use' }
      },
      execute: this.createCampaign.bind(this)
    })

    this.availableTools.set('get_campaigns', {
      name: 'get_campaigns',
      description: 'Get list of all campaigns',
      parameters: {},
      execute: this.getCampaigns.bind(this)
    })

    this.availableTools.set('get_campaign_status', {
      name: 'get_campaign_status',
      description: 'Get status of a specific campaign',
      parameters: {
        campaignId: { type: 'string', required: true, description: 'Campaign ID' }
      },
      execute: this.getCampaignStatus.bind(this)
    })

    // Audience Management Tools
    this.availableTools.set('segment_audience', {
      name: 'segment_audience',
      description: 'Segment audience based on criteria',
      parameters: {
        criteria: { type: 'string', required: true, description: 'Segmentation criteria' }
      },
      execute: this.segmentAudience.bind(this)
    })

    this.availableTools.set('get_audience_stats', {
      name: 'get_audience_stats',
      description: 'Get audience statistics',
      parameters: {},
      execute: this.getAudienceStats.bind(this)
    })

    // Email Template Tools
    this.availableTools.set('create_template', {
      name: 'create_template',
      description: 'Create a new email template',
      parameters: {
        name: { type: 'string', required: true, description: 'Template name' },
        subject: { type: 'string', required: true, description: 'Email subject' },
        content: { type: 'string', required: true, description: 'Email content' },
        audience: { type: 'string', required: false, description: 'Target audience' }
      },
      execute: this.createTemplate.bind(this)
    })

    this.availableTools.set('get_templates', {
      name: 'get_templates',
      description: 'Get list of email templates',
      parameters: {},
      execute: this.getTemplates.bind(this)
    })

    // System Status Tools
    this.availableTools.set('get_system_status', {
      name: 'get_system_status',
      description: 'Get overall system status',
      parameters: {},
      execute: this.getSystemStatus.bind(this)
    })

    this.availableTools.set('get_recent_rsvps', {
      name: 'get_recent_rsvps',
      description: 'Get recent RSVP data',
      parameters: {
        limit: { type: 'number', required: false, description: 'Number of recent RSVPs to fetch' }
      },
      execute: this.getRecentRSVPs.bind(this)
    })
  }

  /**
   * Process a user message and execute appropriate tools
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
      // Determine which tools to use based on the message
      const toolCalls = this.determineToolCalls(userMessage)
      
      // Execute tool calls
      const toolResults = await this.executeToolCalls(toolCalls)

      // Generate response based on tool results
      const response = await this.generateResponse(userMessage, toolCalls, toolResults)

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
        message: 'Sorry, I encountered an error processing your request. Please try again.',
        toolCalls: [],
        confidence: 0,
        suggestions: ['Try asking about campaign status', 'Ask about audience data', 'Check system status']
      }

      return errorResponse
    }
  }

  /**
   * Determine which tools to call based on user message
   */
  private determineToolCalls(message: string): ToolCall[] {
    const toolCalls: ToolCall[] = []
    const lowerMessage = message.toLowerCase()

    // Campaign-related commands
    if (lowerMessage.includes('create') && lowerMessage.includes('campaign')) {
      const params = this.extractCampaignParams(message)
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'create_campaign',
        parameters: params,
        status: 'pending'
      })
    } else if (lowerMessage.includes('show') && lowerMessage.includes('campaign')) {
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'get_campaigns',
        parameters: {},
        status: 'pending'
      })
    } else if (lowerMessage.includes('campaign') && lowerMessage.includes('status')) {
      const campaignId = this.extractCampaignId(message)
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'get_campaign_status',
        parameters: { campaignId },
        status: 'pending'
      })
    }

    // Audience-related commands
    else if (lowerMessage.includes('segment') && lowerMessage.includes('audience')) {
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'segment_audience',
        parameters: { criteria: 'engagement' },
        status: 'pending'
      })
    } else if (lowerMessage.includes('audience') && lowerMessage.includes('stats')) {
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'get_audience_stats',
        parameters: {},
        status: 'pending'
      })
    }

    // Template-related commands
    else if (lowerMessage.includes('create') && lowerMessage.includes('template')) {
      const params = this.extractTemplateParams(message)
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'create_template',
        parameters: params,
        status: 'pending'
      })
    } else if (lowerMessage.includes('show') && lowerMessage.includes('template')) {
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'get_templates',
        parameters: {},
        status: 'pending'
      })
    }

    // System status commands
    else if (lowerMessage.includes('system') && lowerMessage.includes('status')) {
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'get_system_status',
        parameters: {},
        status: 'pending'
      })
    } else if (lowerMessage.includes('recent') && lowerMessage.includes('rsvp')) {
      toolCalls.push({
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'get_recent_rsvps',
        parameters: { limit: 10 },
        status: 'pending'
      })
    }

    return toolCalls
  }

  /**
   * Execute tool calls
   */
  private async executeToolCalls(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    const results: ToolResult[] = []

    for (const toolCall of toolCalls) {
      try {
        toolCall.status = 'running'
        
        const tool = this.availableTools.get(toolCall.name)
        if (!tool) {
          throw new Error(`Tool ${toolCall.name} not found`)
        }

        const result = await tool.execute(toolCall.parameters)
        
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
   * Generate response based on tool results
   */
  private async generateResponse(userMessage: string, toolCalls: ToolCall[], toolResults: ToolResult[]): Promise<AIResponse> {
    let response = ''
    const suggestions: string[] = []

    if (toolCalls.length === 0) {
      response = "I can help you manage your RSVP system. Try asking me to:\n- Show campaign status\n- Create a new campaign\n- Analyze audience data\n- Check recent RSVPs\n- Create email templates"
      suggestions.push("Show campaign status", "Create a new campaign", "Analyze audience data")
    } else {
      const successfulTools = toolResults.filter(r => r.success)
      const failedTools = toolResults.filter(r => !r.success)

      if (successfulTools.length > 0) {
        response += "✅ **Task completed successfully!**\n\n"
        
        for (const result of successfulTools) {
          const toolCall = toolCalls.find(tc => tc.id === result.toolCallId)
          if (toolCall) {
            response += `**${toolCall.name.replace('_', ' ').toUpperCase()}:**\n`
            response += `${JSON.stringify(result.result, null, 2)}\n\n`
          }
        }
      }

      if (failedTools.length > 0) {
        response += "❌ **Some tasks failed:**\n\n"
        for (const result of failedTools) {
          const toolCall = toolCalls.find(tc => tc.id === result.toolCallId)
          if (toolCall) {
            response += `**${toolCall.name.replace('_', ' ').toUpperCase()}:** ${result.error}\n`
          }
        }
      }

      // Add relevant suggestions based on what was executed
      if (toolCalls.some(tc => tc.name.includes('campaign'))) {
        suggestions.push("Check campaign performance", "Create another campaign", "View audience segments")
      }
      if (toolCalls.some(tc => tc.name.includes('audience'))) {
        suggestions.push("Create targeted campaign", "Analyze engagement data", "Update audience groups")
      }
      if (toolCalls.some(tc => tc.name.includes('template'))) {
        suggestions.push("Test template", "Create campaign with template", "Optimize template")
      }
    }

    return {
      message: response,
      toolCalls: toolCalls,
      confidence: 0.85,
      suggestions: suggestions
    }
  }

  // Tool execution methods (simulated for now)
  private async createCampaign(params: any): Promise<any> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      id: `campaign_${Date.now()}`,
      name: params.name,
      status: 'created',
      message: `Campaign "${params.name}" created successfully for ${params.audience} audience`
    }
  }

  private async getCampaigns(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      campaigns: [
        { id: '1', name: 'Healthcare Outreach', status: 'active', audience: 'Healthcare' },
        { id: '2', name: 'Construction Update', status: 'draft', audience: 'Construction' },
        { id: '3', name: 'Professional Services', status: 'completed', audience: 'Professional' }
      ],
      total: 3
    }
  }

  private async getCampaignStatus(params: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return {
      campaignId: params.campaignId,
      status: 'active',
      sent: 150,
      opened: 45,
      clicked: 12,
      conversion: 8
    }
  }

  private async segmentAudience(params: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return {
      segments: [
        { name: 'High Engagement', count: 45, criteria: 'opened_last_30_days' },
        { name: 'Medium Engagement', count: 78, criteria: 'opened_last_90_days' },
        { name: 'Low Engagement', count: 23, criteria: 'no_opens_90_days' }
      ],
      total: 146
    }
  }

  private async getAudienceStats(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 250))
    return {
      total: 767,
      verified: 1122,
      engagement_rate: 23.4,
      top_segments: ['Healthcare', 'Professional Services', 'Construction']
    }
  }

  private async createTemplate(params: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 600))
    return {
      id: `template_${Date.now()}`,
      name: params.name,
      status: 'created',
      message: `Template "${params.name}" created successfully`
    }
  }

  private async getTemplates(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return {
      templates: [
        { id: '1', name: 'Healthcare Welcome', subject: 'Welcome to our healthcare services' },
        { id: '2', name: 'Construction Update', subject: 'Latest construction industry news' },
        { id: '3', name: 'Professional Services', subject: 'Professional development opportunities' }
      ],
      total: 3
    }
  }

  private async getSystemStatus(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 150))
    return {
      status: 'healthy',
      campaigns_active: 2,
      total_rsvps: 45,
      email_delivery: 'normal',
      last_backup: '2024-01-15T10:30:00Z'
    }
  }

  private async getRecentRSVPs(params: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      rsvps: [
        { id: '1', name: 'John Smith', company: 'ABC Healthcare', event: 'AI Workshop', date: '2024-01-15' },
        { id: '2', name: 'Jane Doe', company: 'XYZ Construction', event: 'AI Workshop', date: '2024-01-14' },
        { id: '3', name: 'Bob Johnson', company: 'Professional Services Inc', event: 'AI Workshop', date: '2024-01-13' }
      ],
      total: params.limit || 10
    }
  }

  // Helper methods
  private extractCampaignParams(message: string): any {
    const params: any = {
      name: 'New Campaign',
      description: 'Campaign created via AI',
      audience: 'General',
      template: 'Default'
    }

    if (message.toLowerCase().includes('healthcare')) {
      params.audience = 'Healthcare'
    } else if (message.toLowerCase().includes('construction')) {
      params.audience = 'Construction'
    } else if (message.toLowerCase().includes('professional')) {
      params.audience = 'Professional Services'
    }

    const nameMatch = message.match(/create.*?campaign.*?["']([^"']+)["']/i)
    if (nameMatch) {
      params.name = nameMatch[1]
    }

    return params
  }

  private extractTemplateParams(message: string): any {
    return {
      name: 'New Template',
      subject: 'Email Subject',
      content: 'Email content here',
      audience: 'General'
    }
  }

  private extractCampaignId(message: string): string {
    const idMatch = message.match(/campaign[_\s]*(\w+)/i)
    return idMatch ? idMatch[1] : '1'
  }
}

// Tool function interface
interface ToolFunction {
  name: string
  description: string
  parameters: Record<string, any>
  execute: (params: any) => Promise<any>
}
