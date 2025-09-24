interface AIResponse {
  message: string
  confidence: number
  toolCalls: any[]
  toolResults?: any[]
  nextSteps: string[]
}

export class APIBasedAgent {
  private baseUrl: string
  private aiServiceUrl: string

  constructor() {
    this.baseUrl = '/api'
    // Use environment variable or default to localhost for development
    this.aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3001'
  }

  async processMessage(message: string): Promise<AIResponse> {
    try {
      // Call the external AI service on Render
      const aiResponse = await fetch(`${this.aiServiceUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          context: {}
        })
      })

      if (!aiResponse.ok) {
        throw new Error(`AI Service error: ${aiResponse.status}`)
      }

      const aiData = await aiResponse.json()
      
      // Handle any actions returned by the AI service
      if (aiData.actions && aiData.actions.length > 0) {
        for (const action of aiData.actions) {
          if (action.type === 'create_template') {
            await this.executeTemplateCreation(action.data)
          } else if (action.type === 'create_campaign') {
            await this.executeCampaignCreation(action.data)
          }
        }
      }

      return {
        message: aiData.message,
        confidence: aiData.confidence || 0.8,
        toolCalls: [],
        toolResults: [],
        nextSteps: aiData.nextSteps || []
      }
    } catch (error) {
      console.error('AI Service error:', error)
      return {
        message: "I'm having trouble connecting to the AI service right now. Please try again in a moment.",
        confidence: 0.1,
        toolCalls: [],
        toolResults: [],
        nextSteps: ['Check AI service connectivity', 'Retry the request']
      }
    }
  }

  private shouldCreateTemplate(message: string, aiResponse: string): boolean {
    const createKeywords = ['create', 'make', 'build', 'design']
    const templateKeywords = ['template', 'email template', 'email design']
    
    const messageLower = message.toLowerCase()
    const responseLower = aiResponse.toLowerCase()
    
    return (
      createKeywords.some(keyword => messageLower.includes(keyword)) &&
      templateKeywords.some(keyword => messageLower.includes(keyword))
    ) || responseLower.includes('template')
  }

  private shouldCreateCampaign(message: string, aiResponse: string): boolean {
    const createKeywords = ['create', 'make', 'build', 'launch']
    const campaignKeywords = ['campaign', 'email campaign', 'marketing campaign']
    
    const messageLower = message.toLowerCase()
    const responseLower = aiResponse.toLowerCase()
    
    return (
      createKeywords.some(keyword => messageLower.includes(keyword)) &&
      campaignKeywords.some(keyword => messageLower.includes(keyword))
    ) || responseLower.includes('campaign')
  }

  private async handleTemplateCreation(message: string, aiData: any): Promise<AIResponse> {
    try {
      // Extract template details from the message
      const templateData = this.extractTemplateData(message)
      
      if (!templateData.name || !templateData.subject) {
        return {
          message: "I'd be happy to create a template! I need a few details:\n\n• **Template name**: What should we call it?\n• **Subject line**: What should the email subject be?\n• **Content**: What should the email say?\n\nCould you provide these details?",
          confidence: 0.9,
          toolCalls: [],
          toolResults: [],
          nextSteps: ['Gather template details', 'Create template via API']
        }
      }

      // Create template via API
      const response = await fetch(`${this.baseUrl}/admin/campaign/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateData.name,
          subject: templateData.subject,
          htmlBody: templateData.htmlBody || `<h1>${templateData.subject}</h1><p>${templateData.content || 'Your email content here'}</p>`,
          textBody: templateData.textBody || templateData.content || 'Your email content here'
        })
      })

      if (!response.ok) {
        throw new Error(`Template creation failed: ${response.status}`)
      }

      const result = await response.json()

      return {
        message: `✅ Template "${templateData.name}" created successfully!\n\n**Subject**: ${templateData.subject}\n**Template ID**: ${result.id}\n\nYou can now use this template for your campaigns. Would you like me to help you create a campaign with this template?`,
        confidence: 1.0,
        toolCalls: [],
        toolResults: [],
        nextSteps: ['Template created', 'Ready for campaign creation']
      }
    } catch (error) {
      console.error('Template creation error:', error)
      return {
        message: "I had trouble creating the template. Let me try a different approach. Could you provide the template details again?",
        confidence: 0.3,
        toolCalls: [],
        toolResults: [],
        nextSteps: ['Retry template creation', 'Check API connectivity']
      }
    }
  }

  private async handleCampaignCreation(message: string, aiData: any): Promise<AIResponse> {
    try {
      // Extract campaign details from the message
      const campaignData = this.extractCampaignData(message)
      
      if (!campaignData.name) {
        return {
          message: "I'd be happy to create a campaign! I need a few details:\n\n• **Campaign name**: What should we call it?\n• **Target audience**: Who should receive it?\n• **Email template**: Which template should we use?\n• **Schedule**: When should it be sent?\n\nCould you provide these details?",
          confidence: 0.9,
          toolCalls: [],
          toolResults: [],
          nextSteps: ['Gather campaign details', 'Create campaign via API']
        }
      }

      // Create campaign via API
      const response = await fetch(`${this.baseUrl}/admin/campaign/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: campaignData.name,
          description: campaignData.description || `Campaign: ${campaignData.name}`,
          steps: [
            {
              type: 'email',
              templateId: campaignData.templateId || 1, // Default template
              delay: 0
            }
          ],
          audienceGroupId: campaignData.audienceGroupId || 1 // Default audience
        })
      })

      if (!response.ok) {
        throw new Error(`Campaign creation failed: ${response.status}`)
      }

      const result = await response.json()

      return {
        message: `✅ Campaign "${campaignData.name}" created successfully!\n\n**Campaign ID**: ${result.id}\n**Status**: ${result.status}\n\nYour campaign is ready! Would you like me to help you schedule it or make any adjustments?`,
        confidence: 1.0,
        toolCalls: [],
        toolResults: [],
        nextSteps: ['Campaign created', 'Ready for scheduling']
      }
    } catch (error) {
      console.error('Campaign creation error:', error)
      return {
        message: "I had trouble creating the campaign. Let me try a different approach. Could you provide the campaign details again?",
        confidence: 0.3,
        toolCalls: [],
        toolResults: [],
        nextSteps: ['Retry campaign creation', 'Check API connectivity']
      }
    }
  }

  private extractTemplateData(message: string): any {
    const data: any = {}
    const messageLower = message.toLowerCase()
    
    // Extract name - multiple patterns
    const namePatterns = [
      /(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i,
      /template\s+(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i,
      /email\s+template\s+(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i,
      /create\s+(?:a\s+)?template\s+(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i,
      /make\s+(?:a\s+)?template\s+(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i
    ]
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern)
      if (match) {
        data.name = match[1].trim()
        break
      }
    }

    // Extract subject - multiple patterns
    const subjectPatterns = [
      /(?:subject|title)\s+["']([^"']+)["']/i,
      /(?:subject|title)\s+([a-zA-Z0-9\s]+)/i,
      /with\s+(?:subject|title)\s+["']([^"']+)["']/i
    ]
    
    for (const pattern of subjectPatterns) {
      const match = message.match(pattern)
      if (match) {
        data.subject = match[1].trim()
        break
      }
    }

    // Extract content - multiple patterns
    const contentPatterns = [
      /(?:content|body|message)\s+["']([^"']+)["']/i,
      /(?:content|body|message)\s+([a-zA-Z0-9\s]+)/i,
      /saying\s+["']([^"']+)["']/i,
      /that\s+says\s+["']([^"']+)["']/i
    ]
    
    for (const pattern of contentPatterns) {
      const match = message.match(pattern)
      if (match) {
        data.content = match[1].trim()
        break
      }
    }

    // If no name found but we have a simple pattern like "template test" or "test template"
    if (!data.name) {
      const simplePatterns = [
        /template\s+([a-zA-Z0-9]+)/i,
        /([a-zA-Z0-9]+)\s+template/i,
        /create\s+([a-zA-Z0-9]+)/i,
        /make\s+([a-zA-Z0-9]+)/i
      ]
      
      for (const pattern of simplePatterns) {
        const match = message.match(pattern)
        if (match) {
          data.name = match[1].trim()
          break
        }
      }
    }

    return data
  }

  private extractCampaignData(message: string): any {
    const data: any = {}
    
    // Extract name - multiple patterns
    const namePatterns = [
      /(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i,
      /campaign\s+(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i,
      /email\s+campaign\s+(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i,
      /create\s+(?:a\s+)?campaign\s+(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i,
      /make\s+(?:a\s+)?campaign\s+(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i
    ]
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern)
      if (match) {
        data.name = match[1].trim()
        break
      }
    }

    // If no name found but we have a simple pattern like "campaign test" or "test campaign"
    if (!data.name) {
      const simplePatterns = [
        /campaign\s+([a-zA-Z0-9]+)/i,
        /([a-zA-Z0-9]+)\s+campaign/i,
        /create\s+([a-zA-Z0-9]+)/i,
        /make\s+([a-zA-Z0-9]+)/i
      ]
      
      for (const pattern of simplePatterns) {
        const match = message.match(pattern)
        if (match) {
          data.name = match[1].trim()
          break
        }
      }
    }

    // Extract description - multiple patterns
    const descPatterns = [
      /(?:description|about)\s+["']([^"']+)["']/i,
      /(?:description|about)\s+([a-zA-Z0-9\s]+)/i,
      /for\s+["']([^"']+)["']/i
    ]
    
    for (const pattern of descPatterns) {
      const match = message.match(pattern)
      if (match) {
        data.description = match[1].trim()
        break
      }
    }

    return data
  }

  private async executeTemplateCreation(templateData: any): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/campaign/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData)
      })

      if (!response.ok) {
        console.error('Template creation failed:', response.status)
      }
    } catch (error) {
      console.error('Template creation error:', error)
    }
  }

  private async executeCampaignCreation(campaignData: any): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/campaign/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData)
      })

      if (!response.ok) {
        console.error('Campaign creation failed:', response.status)
      }
    } catch (error) {
      console.error('Campaign creation error:', error)
    }
  }
}
