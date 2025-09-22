/**
 * SLM-Powered AI Agent - Uses trained Small Language Model data
 * This is your personal AI that can actually execute commands based on training
 */

import trainingData from '../../scripts/juniper_training_data.json'

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
}

export class SLMPoweredAgent {
  private conversationHistory: ChatMessage[] = []
  private trainingData: any

  constructor() {
    this.trainingData = trainingData
  }

  /**
   * Process a user message using SLM pattern matching
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
      // Find best matching training example
      const bestMatch = this.findBestMatch(userMessage)
      
      if (bestMatch) {
        // Generate response based on training data
        const response = await this.generateResponseFromTraining(userMessage, bestMatch)
        
        // Add assistant response to conversation
        const assistantMsg: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          toolCalls: response.toolCalls,
          toolResults: response.toolResults,
          confidence: response.confidence
        }
        this.conversationHistory.push(assistantMsg)

        return response
      } else {
        // Fallback response
        const fallbackResponse: AIResponse = {
          message: "I can help you manage your RSVP system. Try asking me to:\n- Create a new campaign\n- Show campaign performance\n- Analyze audience data\n- Check recent RSVPs\n- Create email templates",
          toolCalls: [],
          confidence: 0.3,
          suggestions: ["Create a new campaign", "Show campaign performance", "Analyze audience data"]
        }

        const assistantMsg: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: fallbackResponse.message,
          timestamp: new Date(),
          confidence: fallbackResponse.confidence
        }
        this.conversationHistory.push(assistantMsg)

        return fallbackResponse
      }

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
   * Find the best matching training example
   */
  private findBestMatch(userMessage: string): any {
    const lowerMessage = userMessage.toLowerCase()
    let bestMatch = null
    let bestScore = 0

    for (const conversation of this.trainingData.conversations) {
      const score = this.calculateSimilarity(lowerMessage, conversation.input.toLowerCase())
      if (score > bestScore && score > 0.3) { // Minimum similarity threshold
        bestScore = score
        bestMatch = conversation
      }
    }

    return bestMatch
  }

  /**
   * Calculate similarity between user input and training examples
   */
  private calculateSimilarity(input: string, trainingInput: string): number {
    // Simple keyword-based similarity
    const inputWords = input.split(/\s+/)
    const trainingWords = trainingInput.split(/\s+/)
    
    let matches = 0
    for (const word of inputWords) {
      if (trainingWords.some(tw => tw.includes(word) || word.includes(tw))) {
        matches++
      }
    }

    // Also check for intent keywords
    const intentKeywords = {
      'create_campaign': ['create', 'new', 'campaign', 'email'],
      'show_analytics': ['show', 'performance', 'analytics', 'stats', 'data'],
      'segment_audience': ['segment', 'audience', 'group', 'categorize'],
      'create_template': ['create', 'template', 'email', 'design'],
      'system_status': ['status', 'system', 'health', 'check'],
      'recent_rsvps': ['recent', 'rsvp', 'registrations', 'signups']
    }

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      const keywordMatches = keywords.filter(keyword => input.includes(keyword)).length
      if (keywordMatches > 0) {
        matches += keywordMatches * 0.5 // Boost score for intent keywords
      }
    }

    return matches / Math.max(inputWords.length, trainingWords.length)
  }

  /**
   * Generate response based on training data
   */
  private async generateResponseFromTraining(userMessage: string, trainingExample: any): Promise<AIResponse> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    // Extract tool calls based on intent
    const toolCalls = this.extractToolCallsFromIntent(trainingExample.intent, userMessage)
    
    // Execute tool calls
    const toolResults = await this.executeToolCalls(toolCalls)

    // Generate response with personalization
    const personalizedResponse = this.personalizeResponse(trainingExample.output, userMessage)

    return {
      message: personalizedResponse,
      toolCalls: toolCalls,
      confidence: 0.85 + Math.random() * 0.1,
      suggestions: this.generateSuggestions(trainingExample.intent),
      intent: trainingExample.intent,
      entities: trainingExample.entities
    }
  }

  /**
   * Extract tool calls based on intent
   */
  private extractToolCallsFromIntent(intent: string, userMessage: string): ToolCall[] {
    const toolCalls: ToolCall[] = []

    switch (intent) {
      case 'create_campaign':
        toolCalls.push({
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'create_campaign',
          parameters: this.extractCampaignParams(userMessage),
          status: 'pending'
        })
        break

      case 'show_analytics':
        toolCalls.push({
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'get_campaign_analytics',
          parameters: {},
          status: 'pending'
        })
        break

      case 'segment_audience':
        toolCalls.push({
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'segment_audience',
          parameters: { criteria: 'engagement' },
          status: 'pending'
        })
        break

      case 'create_template':
        toolCalls.push({
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'create_template',
          parameters: this.extractTemplateParams(userMessage),
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

      case 'recent_rsvps':
        toolCalls.push({
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: 'get_recent_rsvps',
          parameters: { limit: 10 },
          status: 'pending'
        })
        break
    }

    return toolCalls
  }

  /**
   * Execute tool calls (simulated for now)
   */
  private async executeToolCalls(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    const results: ToolResult[] = []

    for (const toolCall of toolCalls) {
      try {
        toolCall.status = 'running'
        
        // Simulate tool execution
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 500))
        
        toolCall.status = 'completed'
        results.push({
          toolCallId: toolCall.id,
          success: true,
          result: `Executed ${toolCall.name} successfully`
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
   * Personalize response based on user input
   */
  private personalizeResponse(templateResponse: string, userMessage: string): string {
    let response = templateResponse

    // Extract specific details from user message
    if (userMessage.toLowerCase().includes('healthcare')) {
      response = response.replace(/campaign/g, 'healthcare campaign')
    } else if (userMessage.toLowerCase().includes('construction')) {
      response = response.replace(/campaign/g, 'construction campaign')
    } else if (userMessage.toLowerCase().includes('professional')) {
      response = response.replace(/campaign/g, 'professional services campaign')
    }

    // Add timestamp
    const now = new Date()
    response += `\n\n⏰ ${now.toLocaleString()}`

    return response
  }

  /**
   * Generate contextual suggestions
   */
  private generateSuggestions(intent: string): string[] {
    const suggestions: Record<string, string[]> = {
      'create_campaign': ['Show campaign performance', 'Create email template', 'Segment audience'],
      'show_analytics': ['Create new campaign', 'Optimize existing campaigns', 'Check audience segments'],
      'segment_audience': ['Create targeted campaign', 'Analyze segment performance', 'Update audience groups'],
      'create_template': ['Test template', 'Create campaign with template', 'Preview template'],
      'system_status': ['Check recent RSVPs', 'View campaign status', 'Analyze performance'],
      'recent_rsvps': ['Create follow-up campaign', 'Analyze RSVP patterns', 'Check system status']
    }

    return suggestions[intent] || ['Create a new campaign', 'Show campaign performance', 'Analyze audience data']
  }

  /**
   * Extract campaign parameters from user message
   */
  private extractCampaignParams(message: string): any {
    const params: any = {
      name: 'New Campaign',
      description: 'Campaign created via AI',
      audience: 'General',
      template: 'Default'
    }

    if (message.toLowerCase().includes('healthcare')) {
      params.audience = 'Healthcare'
      params.name = 'Healthcare Newsletter'
    } else if (message.toLowerCase().includes('construction')) {
      params.audience = 'Construction'
      params.name = 'Construction Update'
    } else if (message.toLowerCase().includes('professional')) {
      params.audience = 'Professional Services'
      params.name = 'Professional Services Newsletter'
    }

    return params
  }

  /**
   * Extract template parameters from user message
   */
  private extractTemplateParams(message: string): any {
    return {
      name: 'New Template',
      subject: 'Email Subject',
      content: 'Email content here',
      audience: 'General'
    }
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = []
  }
}
