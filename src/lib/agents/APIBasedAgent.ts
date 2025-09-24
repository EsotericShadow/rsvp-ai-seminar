interface AIResponse {
  message: string
  confidence: number
  toolCalls: any[]
  toolResults?: any[]
  nextSteps: string[]
}

export class APIBasedAgent {
  private baseUrl: string

  constructor() {
    this.baseUrl = '/api'
  }

  async processMessage(message: string): Promise<AIResponse> {
    try {
      // First, get AI response from the AI agent API
      const aiResponse = await fetch(`${this.baseUrl}/ai-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          action: 'chat',
          context: {}
        })
      })

      if (!aiResponse.ok) {
        throw new Error(`AI API error: ${aiResponse.status}`)
      }

      const aiData = await aiResponse.json()
      
      // If the AI suggests creating a template, handle it through the API
      if (this.shouldCreateTemplate(message, aiData.answer)) {
        return await this.handleTemplateCreation(message, aiData)
      }

      // If the AI suggests creating a campaign, handle it through the API
      if (this.shouldCreateCampaign(message, aiData.answer)) {
        return await this.handleCampaignCreation(message, aiData)
      }

      return {
        message: aiData.answer,
        confidence: aiData.confidence || 0.8,
        toolCalls: [],
        toolResults: [],
        nextSteps: aiData.nextSteps || []
      }
    } catch (error) {
      console.error('API Agent error:', error)
      return {
        message: "I'm having trouble connecting to the system right now. Please try again in a moment.",
        confidence: 0.1,
        toolCalls: [],
        toolResults: [],
        nextSteps: ['Check system connectivity', 'Retry the request']
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
    
    // Extract name
    const nameMatch = message.match(/(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i)
    if (nameMatch) {
      data.name = nameMatch[1].trim()
    }

    // Extract subject
    const subjectMatch = message.match(/(?:subject|title)\s+["']([^"']+)["']/i)
    if (subjectMatch) {
      data.subject = subjectMatch[1]
    }

    // Extract content
    const contentMatch = message.match(/(?:content|body|message)\s+["']([^"']+)["']/i)
    if (contentMatch) {
      data.content = contentMatch[1]
    }

    return data
  }

  private extractCampaignData(message: string): any {
    const data: any = {}
    
    // Extract name
    const nameMatch = message.match(/(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i)
    if (nameMatch) {
      data.name = nameMatch[1].trim()
    }

    // Extract description
    const descMatch = message.match(/(?:description|about)\s+["']([^"']+)["']/i)
    if (descMatch) {
      data.description = descMatch[1]
    }

    return data
  }
}
