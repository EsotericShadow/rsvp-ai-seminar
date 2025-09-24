// Server-side AI Agent for Juniper
// This runs on Render and handles AI conversations

class ServerSideAIAgent {
  constructor() {
    this.context = {
      messages: [],
      currentTask: undefined
    };
  }

  async processMessage(userMessage) {
    // Add user message to context
    this.context.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    // Analyze the message and determine intent
    const intent = this.analyzeIntent(userMessage);
    
    // Handle based on intent and current context
    let response;
    
    if (intent.type === 'create_template') {
      response = await this.handleTemplateCreation(userMessage, intent);
    } else if (intent.type === 'create_campaign') {
      response = await this.handleCampaignCreation(userMessage, intent);
    } else {
      response = await this.handleGeneralQuery(userMessage);
    }

    // Add assistant response to context
    this.context.messages.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date()
    });

    return response;
  }

  analyzeIntent(message) {
    const messageLower = message.toLowerCase();
    
    // Template creation patterns
    const templatePatterns = [
      /create.*template/i,
      /make.*template/i,
      /template.*named/i,
      /email.*template/i
    ];
    
    // Campaign creation patterns
    const campaignPatterns = [
      /create.*campaign/i,
      /make.*campaign/i,
      /campaign.*named/i,
      /email.*campaign/i
    ];

    if (templatePatterns.some(pattern => pattern.test(message))) {
      return {
        type: 'create_template',
        confidence: 0.9,
        extractedData: this.extractTemplateData(message)
      };
    }
    
    if (campaignPatterns.some(pattern => pattern.test(message))) {
      return {
        type: 'create_campaign',
        confidence: 0.9,
        extractedData: this.extractCampaignData(message)
      };
    }

    return {
      type: 'general',
      confidence: 0.7,
      extractedData: {}
    };
  }

  extractTemplateData(message) {
    const data = {};
    
    // Extract name - multiple patterns
    const namePatterns = [
      /(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i,
      /template\s+(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i,
      /email\s+template\s+(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i,
      /create\s+(?:a\s+)?template\s+(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i,
      /make\s+(?:a\s+)?template\s+(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match) {
        data.name = match[1].trim();
        break;
      }
    }

    // If no name found, try simple patterns
    if (!data.name) {
      const simplePatterns = [
        /template\s+([a-zA-Z0-9]+)/i,
        /([a-zA-Z0-9]+)\s+template/i,
        /create\s+([a-zA-Z0-9]+)/i,
        /make\s+([a-zA-Z0-9]+)/i
      ];
      
      for (const pattern of simplePatterns) {
        const match = message.match(pattern);
        if (match) {
          data.name = match[1].trim();
          break;
        }
      }
    }

    // Extract subject
    const subjectPatterns = [
      /(?:subject|title)\s+["']([^"']+)["']/i,
      /(?:subject|title)\s+([a-zA-Z0-9\s]+)/i
    ];
    
    for (const pattern of subjectPatterns) {
      const match = message.match(pattern);
      if (match) {
        data.subject = match[1].trim();
        break;
      }
    }

    // Extract content
    const contentPatterns = [
      /(?:content|body|message)\s+["']([^"']+)["']/i,
      /(?:content|body|message)\s+([a-zA-Z0-9\s]+)/i
    ];
    
    for (const pattern of contentPatterns) {
      const match = message.match(pattern);
      if (match) {
        data.content = match[1].trim();
        break;
      }
    }

    return data;
  }

  extractCampaignData(message) {
    const data = {};
    
    // Extract name - multiple patterns
    const namePatterns = [
      /(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i,
      /campaign\s+(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i,
      /email\s+campaign\s+(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i,
      /create\s+(?:a\s+)?campaign\s+(?:named|called|name)\s+([a-zA-Z0-9\s]+)/i,
      /make\s+(?:a\s+)?campaign\s+(?:named|called|name)\s+([a-zA-Z0-9]+)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match) {
        data.name = match[1].trim();
        break;
      }
    }

    // If no name found, try simple patterns
    if (!data.name) {
      const simplePatterns = [
        /campaign\s+([a-zA-Z0-9]+)/i,
        /([a-zA-Z0-9]+)\s+campaign/i,
        /create\s+([a-zA-Z0-9]+)/i,
        /make\s+([a-zA-Z0-9]+)/i
      ];
      
      for (const pattern of simplePatterns) {
        const match = message.match(pattern);
        if (match) {
          data.name = match[1].trim();
          break;
        }
      }
    }

    return data;
  }

  async handleTemplateCreation(message, intent) {
    const templateData = intent.extractedData;
    
    // Check if we have enough information
    if (!templateData.name) {
      return {
        message: "I'd be happy to create a template! I need a few details:\n\n• **Template name**: What should we call it?\n• **Subject line**: What should the email subject be?\n• **Content**: What should the email say?\n\nCould you provide these details?",
        confidence: 0.9,
        nextSteps: ['Gather template details']
      };
    }

    if (!templateData.subject) {
      return {
        message: `Great! I'll create a template named "${templateData.name}". What should the subject line be?`,
        confidence: 0.9,
        nextSteps: ['Get subject line']
      };
    }

    if (!templateData.content) {
      return {
        message: `Perfect! Template "${templateData.name}" with subject "${templateData.subject}". What should the email content say?`,
        confidence: 0.9,
        nextSteps: ['Get email content']
      };
    }

    // We have all the information, create the template
    return {
      message: `✅ I'll create the template "${templateData.name}" with:\n\n**Subject**: ${templateData.subject}\n**Content**: ${templateData.content}\n\nCreating template now...`,
      confidence: 1.0,
      actions: [{
        type: 'create_template',
        data: {
          name: templateData.name,
          subject: templateData.subject,
          htmlBody: `<h1>${templateData.subject}</h1><p>${templateData.content}</p>`,
          textBody: templateData.content
        }
      }],
      nextSteps: ['Template created successfully']
    };
  }

  async handleCampaignCreation(message, intent) {
    const campaignData = intent.extractedData;
    
    if (!campaignData.name) {
      return {
        message: "I'd be happy to create a campaign! I need a few details:\n\n• **Campaign name**: What should we call it?\n• **Target audience**: Who should receive it?\n• **Email template**: Which template should we use?\n• **Schedule**: When should it be sent?\n\nCould you provide these details?",
        confidence: 0.9,
        nextSteps: ['Gather campaign details']
      };
    }

    return {
      message: `✅ I'll create the campaign "${campaignData.name}". Let me set that up for you...`,
      confidence: 1.0,
      actions: [{
        type: 'create_campaign',
        data: {
          name: campaignData.name,
          description: `Campaign: ${campaignData.name}`,
          steps: [{
            type: 'email',
            templateId: 1, // Default template
            delay: 0
          }],
          audienceGroupId: 1 // Default audience
        }
      }],
      nextSteps: ['Campaign created successfully']
    };
  }

  async handleGeneralQuery(message) {
    // For now, provide helpful responses based on keywords
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('help') || messageLower.includes('what can you do')) {
      return {
        message: "I'm Juniper, your AI assistant for the RSVP system! I can help you with:\n\n• **Creating email templates** - Design and customize email templates\n• **Setting up campaigns** - Create and manage email campaigns\n• **Managing audiences** - Organize and segment your email lists\n• **Analyzing performance** - Track campaign metrics and results\n• **Automation workflows** - Set up automated email sequences\n\nWhat would you like to work on?",
        confidence: 0.9,
        nextSteps: ['Ask for specific task']
      };
    }
    
    if (messageLower.includes('template')) {
      return {
        message: "I can help you create email templates! Just tell me:\n\n• What you want to name the template\n• What the subject line should be\n• What content you want in the email\n\nFor example: \"Create a template named welcome with subject 'Welcome to our event!'\"",
        confidence: 0.9,
        nextSteps: ['Get template details']
      };
    }
    
    if (messageLower.includes('campaign')) {
      return {
        message: "I can help you create email campaigns! Just tell me:\n\n• What you want to name the campaign\n• Who should receive it (audience)\n• Which template to use\n• When to send it\n\nFor example: \"Create a campaign named event reminder\"",
        confidence: 0.9,
        nextSteps: ['Get campaign details']
      };
    }

    return {
      message: "I'm here to help with your RSVP system! I can assist with:\n\n• Creating email templates\n• Setting up campaigns\n• Managing audiences\n• Analyzing performance\n\nWhat would you like to work on?",
      confidence: 0.8,
      nextSteps: ['Ask for specific task']
    };
  }
}

module.exports = { ServerSideAIAgent };

