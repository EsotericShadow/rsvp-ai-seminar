"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSideAIAgent = void 0;
const rag_integration_1 = require("../rag-integration");
class ServerSideAIAgent {
    constructor() {
        this.context = {
            messages: []
        };
        this.mainAppUrl = process.env.MAIN_APP_URL || 'http://localhost:3000';
        this.ragSystem = new rag_integration_1.RAGIntegrationSystem();
        this.initializeKnowledgeBase();
    }
    async initializeKnowledgeBase() {
        try {
            console.log('🚀 Auto-initializing Weaviate knowledge base...');
            if (!process.env.WEAVIATE_URL || !process.env.WEAVIATE_API_KEY) {
                console.log('⚠️ Weaviate not configured, skipping knowledge initialization');
                return;
            }
            await this.ragSystem.initializeKnowledgeBase();
            console.log('✅ Knowledge base auto-initialized successfully');
        }
        catch (error) {
            console.error('❌ Failed to auto-initialize knowledge base:', error);
        }
    }
    async processMessage(userMessage, sessionId = 'default', conversationHistory = []) {
        console.log('🤖 Processing message:', userMessage);
        console.log('💬 Session ID:', sessionId);
        console.log('📚 Conversation history length:', conversationHistory.length);
        if (!this.context.messages) {
            this.context.messages = [];
        }
        this.context.messages = conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp || Date.now())
        }));
        this.context.messages.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        });
        const intent = this.analyzeIntent(userMessage, this.context.messages);
        let response;
        if (intent.type === 'create_template' || intent.type === 'continue_template') {
            response = await this.handleTemplateCreation(userMessage, intent, this.context.messages);
        }
        else if (intent.type === 'create_campaign' || intent.type === 'continue_campaign') {
            response = await this.handleCampaignCreation(userMessage, intent, this.context.messages);
        }
        else {
            response = await this.handleGeneralQuery(userMessage, this.context.messages);
        }
        this.context.messages.push({
            role: 'assistant',
            content: response.message,
            timestamp: new Date()
        });
        return response;
    }
    analyzeIntent(message, conversationHistory = []) {
        const messageLower = message.toLowerCase();
        const recentMessages = conversationHistory.slice(-6);
        const hasOngoingTemplate = recentMessages.some(msg => msg.role === 'assistant' &&
            (msg.content.includes('template') || msg.content.includes('subject line') || msg.content.includes('What should the subject line be')));
        const hasOngoingCampaign = recentMessages.some(msg => msg.role === 'assistant' &&
            (msg.content.includes('campaign') || msg.content.includes('description')));
        const templatePatterns = [
            /create.*template/i,
            /make.*template/i,
            /template.*named/i,
            /email.*template/i
        ];
        const campaignPatterns = [
            /create.*campaign/i,
            /make.*campaign/i,
            /campaign.*named/i,
            /email.*campaign/i
        ];
        if (hasOngoingTemplate && message.length < 100 && !messageLower.includes('template') && !messageLower.includes('campaign')) {
            return {
                type: 'continue_template',
                confidence: 0.95,
                extractedData: this.extractTemplateData(message, conversationHistory)
            };
        }
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
        const structuredPatterns = [
            /template name should be ([^,]+)/i,
            /subject line should be ([^,]+)/i,
            /content should be ["']?([^"',]+)["']?/i
        ];
        for (const pattern of structuredPatterns) {
            const match = message.match(pattern);
            if (match) {
                const value = match[1].trim();
                if (pattern.source.includes('template name')) {
                    data.name = value;
                }
                else if (pattern.source.includes('subject line')) {
                    data.subject = value;
                }
                else if (pattern.source.includes('content')) {
                    data.content = value;
                }
            }
        }
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
        if (conversationHistory.length > 0) {
            const recentMessages = conversationHistory.slice(-6);
            for (let i = recentMessages.length - 1; i >= 0; i--) {
                const msg = recentMessages[i];
                if (msg.role === 'assistant' && msg.content.includes('template named')) {
                    const match = msg.content.match(/template named "([^"]+)"/i);
                    if (match && !data.name) {
                        data.name = match[1];
                    }
                }
                if (msg.role === 'assistant' && msg.content.includes('subject line')) {
                    const match = msg.content.match(/subject line "([^"]+)"/i);
                    if (match && !data.subject) {
                        data.subject = match[1];
                    }
                }
                if (msg.role === 'user' && !data.subject && msg.content.length < 50) {
                    const lastAssistantMsg = recentMessages.slice(0, i).reverse().find(m => m.role === 'assistant');
                    if (lastAssistantMsg && lastAssistantMsg.content.includes('subject line')) {
                        data.subject = msg.content.trim();
                    }
                }
                if (msg.role === 'user' && !data.content && msg.content.length < 100) {
                    const lastAssistantMsg = recentMessages.slice(0, i).reverse().find(m => m.role === 'assistant');
                    if (lastAssistantMsg && lastAssistantMsg.content.includes('content')) {
                        data.content = msg.content.trim();
                    }
                }
            }
        }
        return data;
    }
    extractCampaignData(message, _conversationHistory = []) {
        const data = {};
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
    async handleTemplateCreation(message, intent, _conversationHistory = []) {
        const templateData = this.extractTemplateData(message, _conversationHistory);
        const recentMessages = _conversationHistory.slice(-4);
        const hasTemplateContext = recentMessages.some((msg) => msg.role === 'assistant' && msg.content.includes('template'));
        if (intent.type === 'continue_template' && hasTemplateContext) {
            const lastAssistantMessage = recentMessages.reverse().find((msg) => msg.role === 'assistant');
            if (lastAssistantMessage && lastAssistantMessage.content.includes('subject line')) {
                return {
                    message: `Perfect! Subject line "${message}" for template "${templateData.name || 'the template'}". What should the email content be?`,
                    confidence: 0.95,
                    nextSteps: ['Get content', 'Create template']
                };
            }
            else if (lastAssistantMessage && lastAssistantMessage.content.includes('content')) {
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
                    toolCalls: [{
                            id: `create_template_${Date.now()}`,
                            name: 'create_template',
                            parameters: {
                                name: templateData.name || 'test',
                                subject: templateData.subject || 'Test Subject',
                                content: message
                            },
                            status: 'pending'
                        }],
                    nextSteps: ['Template created', 'Ready for campaigns']
                };
            }
        }
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
        }
        catch (error) {
            return {
                message: `❌ **Failed to create template**: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your system configuration and try again.`,
                confidence: 0.1,
                actions: [],
                nextSteps: ['Check system status', 'Retry template creation']
            };
        }
    }
    async handleCampaignCreation(_message, intent, _conversationHistory = []) {
        const campaignData = intent.extractedData;
        if (!campaignData.name) {
            return {
                message: "I'd be happy to create a campaign! I need a few details:\n\n• **Campaign name**: What should we call it?\n• **Target audience**: Who should receive it?\n• **Email template**: Which template should we use?\n• **Schedule**: When should it be sent?\n\nCould you provide these details?",
                confidence: 0.9,
                nextSteps: ['Gather campaign details']
            };
        }
        try {
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
        }
        catch (error) {
            return {
                message: `❌ **Failed to create campaign**: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your system configuration and try again.`,
                confidence: 0.1,
                actions: [],
                nextSteps: ['Check system status', 'Retry campaign creation']
            };
        }
    }
    async handleGeneralQuery(message, _conversationHistory = []) {
        try {
            console.log('🔍 Searching RAG system for:', message);
            const ragResponse = await this.ragSystem.generateRAGResponse(message);
            if (ragResponse && ragResponse.answer) {
                console.log('✅ RAG system provided answer');
                return {
                    message: ragResponse.answer,
                    confidence: ragResponse.confidence || 0.8,
                    sources: ragResponse.sources || [],
                    nextSteps: ragResponse.nextSteps || []
                };
            }
        }
        catch (error) {
            console.log('⚠️ RAG system failed, using fallback:', error instanceof Error ? error.message : 'Unknown error');
        }
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
    async createTemplateInDatabase(templateData) {
        try {
            console.log('📧 Creating template in database:', templateData);
            const response = await fetch(`${this.mainAppUrl}/api/internal/templates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || ''
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
        }
        catch (error) {
            console.error('❌ Error creating template:', error);
            throw error;
        }
    }
    async createCampaignInDatabase(campaignData) {
        try {
            console.log('📢 Creating campaign in database:', campaignData);
            const response = await fetch(`${this.mainAppUrl}/api/internal/campaigns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || ''
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
        }
        catch (error) {
            console.error('❌ Error creating campaign:', error);
            throw error;
        }
    }
    async getAvailableTemplates() {
        try {
            const response = await fetch(`${this.mainAppUrl}/api/internal/templates`, {
                headers: {
                    'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || ''
                }
            });
            if (!response.ok)
                throw new Error(`Failed to fetch templates: ${response.status}`);
            const data = await response.json();
            return data.templates || [];
        }
        catch (error) {
            console.error('❌ Error fetching templates:', error);
            return [];
        }
    }
    async getAvailableAudienceGroups() {
        try {
            const response = await fetch(`${this.mainAppUrl}/api/internal/groups`, {
                headers: {
                    'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || ''
                }
            });
            if (!response.ok)
                throw new Error(`Failed to fetch groups: ${response.status}`);
            const data = await response.json();
            return data.groups || [];
        }
        catch (error) {
            console.error('❌ Error fetching audience groups:', error);
            return [];
        }
    }
    async createAudienceGroupInDatabase(groupData) {
        try {
            console.log('👥 Creating audience group in database:', groupData);
            const response = await fetch(`${this.mainAppUrl}/api/internal/groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || ''
                },
                body: JSON.stringify(groupData)
            });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Group creation failed: ${response.status} - ${error}`);
            }
            const result = await response.json();
            console.log('✅ Audience group created successfully:', result);
            return result;
        }
        catch (error) {
            console.error('❌ Error creating audience group:', error);
            throw error;
        }
    }
    async scheduleCampaignInDatabase(scheduleData) {
        try {
            console.log('📅 Scheduling campaign in database:', scheduleData);
            const response = await fetch(`${this.mainAppUrl}/api/internal/schedules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || ''
                },
                body: JSON.stringify(scheduleData)
            });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Schedule creation failed: ${response.status} - ${error}`);
            }
            const result = await response.json();
            console.log('✅ Campaign scheduled successfully:', result);
            return result;
        }
        catch (error) {
            console.error('❌ Error scheduling campaign:', error);
            throw error;
        }
    }
    async sendCampaignInDatabase(sendData) {
        try {
            console.log('📤 Sending campaign in database:', sendData);
            const response = await fetch(`${this.mainAppUrl}/api/internal/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || ''
                },
                body: JSON.stringify(sendData)
            });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Campaign send failed: ${response.status} - ${error}`);
            }
            const result = await response.json();
            console.log('✅ Campaign sent successfully:', result);
            return result;
        }
        catch (error) {
            console.error('❌ Error sending campaign:', error);
            throw error;
        }
    }
}
exports.ServerSideAIAgent = ServerSideAIAgent;
//# sourceMappingURL=ServerSideAIAgent.js.map