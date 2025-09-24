// Server-side AI Agent for Juniper
// This runs on Render and handles AI conversations

class ServerSideAIAgent {
  constructor() {
    this.context = {
      messages: [],
      currentTask: undefined
    };
    this.mainAppUrl = process.env.MAIN_APP_URL || 'http://localhost:3000';
  }

  async processMessage(userMessage, sessionId = 'default', conversationHistory = []) {
    console.log('🤖 Processing message:', userMessage);
    console.log('💬 Session ID:', sessionId);
    console.log('📚 Conversation history length:', conversationHistory.length);
    
    // Initialize context for this session if not exists
    if (!this.context.messages) {
      this.context.messages = [];
    }
    
    // Load conversation history into context
    this.context.messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp || Date.now())
    }));
    
    // Add current user message to context
    this.context.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    // Analyze the message and determine intent with context
    const intent = this.analyzeIntent(userMessage, this.context.messages);
    
    // Handle based on intent and current context
    let response;
    
    if (intent.type === 'create_template' || intent.type === 'continue_template') {
      response = await this.handleTemplateCreation(userMessage, intent, this.context.messages);
    } else if (intent.type === 'create_campaign' || intent.type === 'continue_campaign') {
      response = await this.handleCampaignCreation(userMessage, intent, this.context.messages);
    } else {
      response = await this.handleGeneralQuery(userMessage, this.context.messages);
    }

    // Add assistant response to context
    this.context.messages.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date()
    });

    return response;
  }

  analyzeIntent(message, conversationHistory = []) {
    const messageLower = message.toLowerCase();
    
    // Check conversation context for ongoing tasks
    const recentMessages = conversationHistory.slice(-6); // Last 3 exchanges
    const hasOngoingTemplate = recentMessages.some(msg => 
      msg.role === 'assistant' && 
      (msg.content.includes('template') || msg.content.includes('subject line') || msg.content.includes('What should the subject line be'))
    );
    
    const hasOngoingCampaign = recentMessages.some(msg => 
      msg.role === 'assistant' && 
      (msg.content.includes('campaign') || msg.content.includes('description'))
    );
    
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

    // If we're in the middle of template creation and user provides simple input
    if (hasOngoingTemplate && message.length < 100 && !messageLower.includes('template') && !messageLower.includes('campaign')) {
      return {
        type: 'continue_template',
        confidence: 0.95,
        extractedData: this.extractTemplateData(message, conversationHistory)
      };
    }
    
    // If we're in the middle of campaign creation and user provides simple input
    if (hasOngoingCampaign && message.length < 50 && !messageLower.includes('campaign')) {
      return {
        type: 'continue_campaign',
        confidence: 0.95,
        extractedData: this.extractCampaignData(message, conversationHistory)
      };
    }

    if (templatePatterns.some(pattern => pattern.test(message))) {
      return {
        type: 'create_template',
        confidence: 0.9,
        extractedData: this.extractTemplateData(message, conversationHistory)
      };
    }
    
    if (campaignPatterns.some(pattern => pattern.test(message))) {
      return {
        type: 'create_campaign',
        confidence: 0.9,
        extractedData: this.extractCampaignData(message, conversationHistory)
      };
    }

    return {
      type: 'general',
      confidence: 0.7,
      extractedData: {}
    };
  }

  extractTemplateData(message, conversationHistory = []) {
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

    // Fill missing data from conversation history if available
    if (conversationHistory.length > 0) {
      const lastAssistantMessage = conversationHistory.reverse().find(msg => msg.role === 'assistant');
      if (lastAssistantMessage) {
        if (!data.name && lastAssistantMessage.content.includes('template named')) {
          const match = lastAssistantMessage.content.match(/template named "([^"]+)"/i);
          if (match) data.name = match[1];
        }
        if (!data.subject && lastAssistantMessage.content.includes('subject line')) {
          const match = lastAssistantMessage.content.match(/subject line "([^"]+)"/i);
          if (match) data.subject = match[1];
        }
      }
    }

    return data;
  }

  extractCampaignData(message, conversationHistory = []) {
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

  async handleTemplateCreation(message, intent, conversationHistory = []) {
    const templateData = intent.extractedData;
    
    // Check conversation context for ongoing template creation
    const recentMessages = conversationHistory.slice(-4);
    const hasTemplateContext = recentMessages.some(msg => 
      msg.role === 'assistant' && msg.content.includes('template')
    );
    
    // If we're continuing a template creation and user provided simple input
    if (intent.type === 'continue_template' && hasTemplateContext) {
      // Check what information we're missing
      const lastAssistantMessage = recentMessages.reverse().find(msg => msg.role === 'assistant');
      
      if (lastAssistantMessage && lastAssistantMessage.content.includes('subject line')) {
        // User is providing subject line
        return {
          message: `Perfect! Subject line "${message}" for template "${templateData.name || 'the template'}". What should the email content be?`,
          confidence: 0.95,
          nextSteps: ['Get content', 'Create template']
        };
      } else if (lastAssistantMessage && lastAssistantMessage.content.includes('content')) {
        // User is providing content
        return {
          message: `Excellent! I'll create the template with:\n\n• **Name**: ${templateData.name || 'the template'}\n• **Subject**: ${templateData.subject || 'the subject'}\n• **Content**: ${message}\n\nCreating template now...`,
          confidence: 0.95,
          actions: [{
            type: 'create_template',
            data: {
              name: templateData.name || 'test',
              subject: templateData.subject || 'Test Subject',
              htmlBody: `<h1>${templateData.subject || 'Test Subject'}</h1><p>${message}</p>`,
              textBody: message
            }
          }],
          nextSteps: ['Template created', 'Ready for campaigns']
        };
      }
    }
    
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
    try {
      const templateResult = await this.createTemplateInDatabase({
        name: templateData.name,
        subject: templateData.subject,
        htmlBody: `<h1>${templateData.subject}</h1><p>${templateData.content}</p>`,
        textBody: templateData.content
      });

      return {
        message: `✅ **Template created successfully!**\n\n**Name**: ${templateData.name}\n**Subject**: ${templateData.subject}\n**Content**: ${templateData.content}\n\nTemplate ID: ${templateResult.template?.id || 'N/A'}\n\nThe template is now ready to use in your campaigns!`,
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
        nextSteps: ['Template ready for campaigns', 'Create campaign with this template']
      };
    } catch (error) {
      return {
        message: `❌ **Failed to create template**: ${error.message}\n\nPlease check your system configuration and try again.`,
        confidence: 0.1,
        actions: [],
        nextSteps: ['Check system status', 'Retry template creation']
      };
    }
  }

  async handleCampaignCreation(message, intent, conversationHistory = []) {
    const campaignData = intent.extractedData;
    
    if (!campaignData.name) {
      return {
        message: "I'd be happy to create a campaign! I need a few details:\n\n• **Campaign name**: What should we call it?\n• **Target audience**: Who should receive it?\n• **Email template**: Which template should we use?\n• **Schedule**: When should it be sent?\n\nCould you provide these details?",
        confidence: 0.9,
        nextSteps: ['Gather campaign details']
      };
    }

    try {
      // Get available templates and groups for better campaign creation
      const [templates, groups] = await Promise.all([
        this.getAvailableTemplates(),
        this.getAvailableAudienceGroups()
      ]);

      const campaignResult = await this.createCampaignInDatabase({
        name: campaignData.name,
        description: campaignData.description || `Campaign: ${campaignData.name}`,
        steps: [{
          type: 'email',
          templateId: templates.length > 0 ? templates[0].id : 1,
          delay: 0
        }]
      });

      return {
        message: `✅ **Campaign created successfully!**\n\n**Name**: ${campaignData.name}\n**Description**: ${campaignData.description || `Campaign: ${campaignData.name}`}\n**Campaign ID**: ${campaignResult.campaign?.id || 'N/A'}\n\nAvailable templates: ${templates.length}\nAvailable audience groups: ${groups.length}\n\nThe campaign is ready for scheduling!`,
        confidence: 1.0,
        actions: [{
          type: 'create_campaign',
          data: {
            name: campaignData.name,
            description: campaignData.description || `Campaign: ${campaignData.name}`,
            steps: [{
              type: 'email',
              templateId: templates.length > 0 ? templates[0].id : 1,
              delay: 0
            }]
          }
        }],
        nextSteps: ['Campaign ready for scheduling', 'Set up campaign schedule', 'Configure audience targeting']
      };
    } catch (error) {
      return {
        message: `❌ **Failed to create campaign**: ${error.message}\n\nPlease check your system configuration and try again.`,
        confidence: 0.1,
        actions: [],
        nextSteps: ['Check system status', 'Retry campaign creation']
      };
    }
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

  // Real database operations
  async createTemplateInDatabase(templateData) {
    try {
      console.log('📧 Creating template in database:', templateData);
      
      const response = await fetch(`${this.mainAppUrl}/api/admin/campaign/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateData.name,
          subject: templateData.subject,
          htmlBody: templateData.htmlBody,
          textBody: templateData.textBody
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Template creation failed: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log('✅ Template created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating template:', error);
      throw error;
    }
  }

  async createCampaignInDatabase(campaignData) {
    try {
      console.log('📢 Creating campaign in database:', campaignData);
      
      const response = await fetch(`${this.mainAppUrl}/api/admin/campaign/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: campaignData.name,
          description: campaignData.description,
          steps: campaignData.steps || [{
            type: 'email',
            templateId: 1,
            delay: 0
          }]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Campaign creation failed: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log('✅ Campaign created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating campaign:', error);
      throw error;
    }
  }

  async getAvailableTemplates() {
    try {
      const response = await fetch(`${this.mainAppUrl}/api/admin/campaign/templates`);
      if (!response.ok) throw new Error(`Failed to fetch templates: ${response.status}`);
      const data = await response.json();
      return data.templates || [];
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
      return [];
    }
  }

  async getAvailableAudienceGroups() {
    try {
      const response = await fetch(`${this.mainAppUrl}/api/admin/campaign/groups`);
      if (!response.ok) throw new Error(`Failed to fetch groups: ${response.status}`);
      const data = await response.json();
      return data.groups || [];
    } catch (error) {
      console.error('❌ Error fetching audience groups:', error);
      return [];
    }
  }

  async createAudienceGroupInDatabase(groupData) {
    try {
      console.log('👥 Creating audience group in database:', groupData);
      
      const response = await fetch(`${this.mainAppUrl}/api/admin/campaign/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupData.name,
          description: groupData.description,
          members: groupData.members.map(member => ({
            businessId: String(member.businessId),
            businessName: member.businessName,
            primaryEmail: String(member.primaryEmail),
            secondaryEmail: member.secondaryEmail,
            inviteToken: member.inviteToken,
            tags: member.tags,
            meta: member.meta
          }))
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Audience group creation failed: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log('✅ Audience group created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating audience group:', error);
      throw error;
    }
  }

  async scheduleCampaignInDatabase(scheduleData) {
    try {
      console.log('📅 Creating campaign schedule in database:', scheduleData);
      
      const response = await fetch(`${this.mainAppUrl}/api/admin/campaign/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: scheduleData.name,
          templateId: String(scheduleData.templateId),
          groupId: String(scheduleData.groupId),
          campaignId: scheduleData.campaignId ? String(scheduleData.campaignId) : null,
          sendAt: scheduleData.sendAt ? new Date(scheduleData.sendAt).toISOString() : null,
          throttlePerMinute: scheduleData.throttlePerMinute || 10,
          status: 'scheduled'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Campaign schedule creation failed: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log('✅ Campaign schedule created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating campaign schedule:', error);
      throw error;
    }
  }

  async sendCampaignInDatabase(sendData) {
    try {
      console.log('📧 Sending campaign in database:', sendData);
      
      const response = await fetch(`${this.mainAppUrl}/api/admin/campaign/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduleId: sendData.scheduleId ? String(sendData.scheduleId) : undefined,
          templateId: sendData.templateId ? String(sendData.templateId) : undefined,
          groupId: sendData.groupId ? String(sendData.groupId) : undefined,
          previewOnly: Boolean(sendData.previewOnly),
          limit: sendData.limit ? Number(sendData.limit) : undefined
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Campaign send failed: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log('✅ Campaign sent successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error sending campaign:', error);
      throw error;
    }
  }
}

module.exports = { ServerSideAIAgent };

