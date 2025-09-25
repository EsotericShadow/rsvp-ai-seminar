"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSideAIAgent = void 0;
const rag_integration_1 = require("../rag-integration");
const command_bridge_1 = require("../command-bridge");
class ServerSideAIAgent {
    constructor() {
        this.context = {
            messages: []
        };
        this.mainAppUrl = process.env.MAIN_APP_URL || 'https://rsvp.evergreenwebsolutions.ca';
        this.ragSystem = new rag_integration_1.RAGIntegrationSystem();
        this.commandBridge = new command_bridge_1.CommandBridge();
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
        console.log('📚 Conversation history:', conversationHistory.map(msg => `${msg.role}: ${msg.content.substring(0, 50)}...`));
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
        if (hasOngoingTemplate && message.length < 200 && !messageLower.includes('template') && !messageLower.includes('campaign')) {
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
    analyzeContextualResponse(message, conversationHistory = []) {
        if (conversationHistory.length < 1) {
            console.log('🔍 Context analysis: No conversation history');
            return null;
        }
        console.log('🔍 Context analysis debug:', {
            message,
            historyLength: conversationHistory.length,
            lastAssistantMessage: conversationHistory[conversationHistory.length - 1]?.content?.substring(0, 100)
        });
        const messageLower = message.toLowerCase().trim();
        const recentMessages = conversationHistory.slice(-8);
        const assistantMessages = recentMessages.filter(msg => msg.role === 'assistant');
        const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
        if (!lastAssistantMessage) {
            console.log('🔍 Context analysis: No assistant message found in recent history');
            return null;
        }
        const assistantContent = lastAssistantMessage.content.toLowerCase();
        console.log('🔍 Context analysis:', {
            userMessage: messageLower,
            assistantContent: assistantContent.substring(0, 150) + '...',
            historyLength: conversationHistory.length,
            recentMessagesCount: recentMessages.length
        });
        if (this.isCampaignDeletionConfirmation(messageLower, assistantContent)) {
            return this.handleCampaignDeletionConfirmation(messageLower, assistantContent);
        }
        if (this.isTemplateDeletionConfirmation(messageLower, assistantContent)) {
            return this.handleTemplateDeletionConfirmation(messageLower, assistantContent);
        }
        if (this.isTemplateNameResponse(messageLower, assistantContent)) {
            return this.handleTemplateNameResponse(message, assistantContent);
        }
        if (this.isTemplateSubjectResponse(messageLower, assistantContent)) {
            return this.handleTemplateSubjectResponse(message, assistantContent);
        }
        if (this.isTemplateContentResponse(messageLower, assistantContent)) {
            return this.handleTemplateContentResponse(message, assistantContent);
        }
        if (this.isCampaignNameResponse(messageLower, assistantContent)) {
            return this.handleCampaignNameResponse(message, assistantContent);
        }
        if (this.isCampaignAudienceResponse(messageLower, assistantContent)) {
            return this.handleCampaignAudienceResponse(message, assistantContent);
        }
        if (this.isListCampaignResponse(messageLower, assistantContent)) {
            return this.handleListCampaignResponse(messageLower, assistantContent);
        }
        if (this.isListTemplateResponse(messageLower, assistantContent)) {
            return this.handleListTemplateResponse(messageLower, assistantContent);
        }
        if (this.isFinalDeletionConfirmation(messageLower, assistantContent)) {
            console.log('🎯 Final deletion confirmation detected!');
            return this.handleFinalDeletionConfirmation(messageLower, assistantContent);
        }
        if (this.isYesNoResponse(messageLower, assistantContent)) {
            return this.handleYesNoResponse(messageLower, assistantContent);
        }
        return null;
    }
    isCampaignDeletionConfirmation(messageLower, assistantContent) {
        return (assistantContent.includes('which campaigns would you like to delete') ||
            assistantContent.includes('what would you like to delete') ||
            assistantContent.includes('delete campaigns')) &&
            (messageLower.includes('all') || messageLower === 'all campaigns' ||
                messageLower.includes('yes delete all') || messageLower.includes('confirm'));
    }
    isTemplateDeletionConfirmation(messageLower, assistantContent) {
        return (assistantContent.includes('which templates would you like to delete') ||
            assistantContent.includes('delete templates')) &&
            (messageLower.includes('all') || messageLower === 'all templates' ||
                messageLower.includes('yes delete all') || messageLower.includes('confirm'));
    }
    isTemplateNameResponse(messageLower, assistantContent) {
        return (assistantContent.includes('template name') ||
            assistantContent.includes('what should we call it') ||
            assistantContent.includes('name the template')) &&
            messageLower.length < 50 &&
            !messageLower.includes('template') &&
            !messageLower.includes('subject') &&
            !messageLower.includes('content');
    }
    isTemplateSubjectResponse(messageLower, assistantContent) {
        return (assistantContent.includes('subject line') ||
            assistantContent.includes('email subject')) &&
            messageLower.length < 100 &&
            !messageLower.includes('template') &&
            !messageLower.includes('content');
    }
    isTemplateContentResponse(messageLower, assistantContent) {
        return (assistantContent.includes('email content') ||
            assistantContent.includes('what should the email say') ||
            assistantContent.includes('content')) &&
            messageLower.length < 200;
    }
    isCampaignNameResponse(messageLower, assistantContent) {
        return (assistantContent.includes('campaign name') ||
            assistantContent.includes('name the campaign')) &&
            messageLower.length < 50 &&
            !messageLower.includes('campaign') &&
            !messageLower.includes('audience') &&
            !messageLower.includes('template');
    }
    isCampaignAudienceResponse(messageLower, assistantContent) {
        return (assistantContent.includes('target audience') ||
            assistantContent.includes('who should receive it')) &&
            messageLower.length < 100;
    }
    isListCampaignResponse(messageLower, assistantContent) {
        return (assistantContent.includes('list campaigns') ||
            assistantContent.includes('show campaigns')) &&
            (messageLower.includes('all') || messageLower.includes('yes') ||
                messageLower.includes('show') || messageLower.includes('list'));
    }
    isListTemplateResponse(messageLower, assistantContent) {
        return (assistantContent.includes('list templates') ||
            assistantContent.includes('show templates')) &&
            (messageLower.includes('all') || messageLower.includes('yes') ||
                messageLower.includes('show') || messageLower.includes('list'));
    }
    isFinalDeletionConfirmation(messageLower, assistantContent) {
        return (messageLower.includes('yes delete all') ||
            messageLower.includes('confirm') ||
            messageLower.includes('proceed')) &&
            (assistantContent.includes('absolutely sure') ||
                assistantContent.includes('type \'yes delete all\'') ||
                assistantContent.includes('delete all campaigns') ||
                assistantContent.includes('delete all templates'));
    }
    isYesNoResponse(messageLower, assistantContent) {
        return (assistantContent.includes('?') || assistantContent.includes('confirm') ||
            assistantContent.includes('proceed') || assistantContent.includes('continue')) &&
            (messageLower === 'yes' || messageLower === 'no' ||
                messageLower === 'y' || messageLower === 'n' ||
                messageLower.includes('yes') || messageLower.includes('no'));
    }
    handleCampaignDeletionConfirmation(messageLower, _assistantContent) {
        if (messageLower.includes('all') || messageLower === 'all campaigns') {
            return {
                message: "✅ **Confirmed: Delete ALL campaigns**\n\n⚠️ **This will permanently delete ALL campaigns and their data.**\n\nTo proceed with deleting all campaigns, I need to:\n\n1. **Retrieve the list** of existing campaigns\n2. **Confirm the deletion** with you\n3. **Execute the deletion** safely\n\n⚠️ **Warning**: This action cannot be undone. All campaign data, analytics, and history will be lost.\n\nAre you absolutely sure you want to delete ALL campaigns? Type 'YES DELETE ALL' to confirm.",
                confidence: 0.95,
                actions: [{
                        type: 'delete_all_campaigns',
                        data: { confirmation: 'pending' }
                    }],
                nextSteps: ['Confirm deletion', 'Execute campaign deletion']
            };
        }
        if (messageLower.includes('draft') || messageLower.includes('unpublished')) {
            return {
                message: "✅ **Confirmed: Delete DRAFT campaigns only**\n\nI'll delete only the draft/unpublished campaigns, keeping active and completed campaigns intact.\n\nLet me retrieve the draft campaigns and show you what will be deleted...",
                confidence: 0.95,
                actions: [{
                        type: 'delete_draft_campaigns',
                        data: { confirmation: 'pending' }
                    }],
                nextSteps: ['List draft campaigns', 'Confirm deletion', 'Execute deletion']
            };
        }
        if (messageLower.includes('specific') || messageLower.includes('particular')) {
            return {
                message: "✅ **Confirmed: Delete SPECIFIC campaign**\n\nI can help you delete a specific campaign by name. Let me show you the available campaigns first:\n\n• **List all campaigns** - See what's available\n• **Search campaigns** - Find by name or keyword\n• **Show campaign details** - Get more information before deleting\n\nWhat would you like to do?",
                confidence: 0.95,
                nextSteps: ['List campaigns', 'Search for specific campaign', 'Confirm deletion']
            };
        }
        return null;
    }
    handleTemplateDeletionConfirmation(messageLower, _assistantContent) {
        if (messageLower.includes('all') || messageLower === 'all templates') {
            return {
                message: "✅ **Confirmed: Delete ALL templates**\n\n⚠️ **This will permanently delete ALL templates.**\n\nBefore proceeding, I need to check:\n\n1. **Template usage** - Which templates are used in active campaigns\n2. **List all templates** - Show you what will be deleted\n3. **Confirm deletion** - Get your final confirmation\n\n⚠️ **Warning**: Deleting templates used in campaigns may break those campaigns.\n\nAre you absolutely sure you want to delete ALL templates? Type 'YES DELETE ALL' to confirm.",
                confidence: 0.95,
                actions: [{
                        type: 'delete_all_templates',
                        data: { confirmation: 'pending' }
                    }],
                nextSteps: ['Check template usage', 'List templates', 'Confirm deletion']
            };
        }
        return null;
    }
    handleTemplateNameResponse(message, _assistantContent) {
        return {
            message: `Perfect! I'll create a template named "${message}". What should the subject line be?`,
            confidence: 0.95,
            nextSteps: ['Get subject line', 'Get content', 'Create template']
        };
    }
    handleTemplateSubjectResponse(message, _assistantContent) {
        return {
            message: `Great! Subject line "${message}". What should the email content say?`,
            confidence: 0.95,
            nextSteps: ['Get content', 'Create template']
        };
    }
    handleTemplateContentResponse(message, _assistantContent) {
        return {
            message: `Excellent! I have all the information I need to create your template. Creating it now...`,
            confidence: 0.95,
            actions: [{
                    type: 'create_template',
                    data: {
                        content: message
                    }
                }],
            nextSteps: ['Template created', 'Ready for campaigns']
        };
    }
    handleCampaignNameResponse(message, _assistantContent) {
        return {
            message: `Great! Campaign "${message}". Who should receive this campaign? (audience/target group)`,
            confidence: 0.95,
            nextSteps: ['Get audience', 'Get template', 'Get schedule', 'Create campaign']
        };
    }
    handleCampaignAudienceResponse(message, _assistantContent) {
        return {
            message: `Perfect! Targeting "${message}". Which email template should we use?`,
            confidence: 0.95,
            nextSteps: ['Get template', 'Get schedule', 'Create campaign']
        };
    }
    handleListCampaignResponse(_messageLower, _assistantContent) {
        return {
            message: `Let me retrieve your campaigns for you...`,
            confidence: 0.95,
            actions: [{
                    type: 'list_campaigns',
                    data: { status: 'retrieving' }
                }],
            nextSteps: ['Display campaigns', 'Show campaign details']
        };
    }
    handleListTemplateResponse(_messageLower, _assistantContent) {
        return {
            message: `Let me retrieve your email templates for you...`,
            confidence: 0.95,
            actions: [{
                    type: 'list_templates',
                    data: { status: 'retrieving' }
                }],
            nextSteps: ['Display templates', 'Show template details']
        };
    }
    handleFinalDeletionConfirmation(_messageLower, assistantContent) {
        if (assistantContent.includes('delete all campaigns') || assistantContent.includes('absolutely sure')) {
            return {
                message: "🚨 **EXECUTING: Delete ALL campaigns**\n\nI'm now deleting all campaigns from the system. This may take a moment...\n\n⚠️ **This action cannot be undone.**\n\nPlease wait while I process the deletion...",
                confidence: 1.0,
                actions: [{
                        type: 'execute_delete_all_campaigns',
                        data: { status: 'executing' }
                    }],
                nextSteps: ['Campaigns deleted', 'System cleanup complete']
            };
        }
        if (assistantContent.includes('delete all templates') || assistantContent.includes('absolutely sure')) {
            return {
                message: "🚨 **EXECUTING: Delete ALL templates**\n\nI'm now deleting all templates from the system. This may take a moment...\n\n⚠️ **This action cannot be undone.**\n\nPlease wait while I process the deletion...",
                confidence: 1.0,
                actions: [{
                        type: 'execute_delete_all_templates',
                        data: { status: 'executing' }
                    }],
                nextSteps: ['Templates deleted', 'System cleanup complete']
            };
        }
        return null;
    }
    handleYesNoResponse(messageLower, _assistantContent) {
        if (messageLower.includes('yes') || messageLower === 'y') {
            return {
                message: `Understood! Proceeding with your request...`,
                confidence: 0.9,
                nextSteps: ['Execute action']
            };
        }
        else if (messageLower.includes('no') || messageLower === 'n') {
            return {
                message: `No problem! Let me know if you need anything else.`,
                confidence: 0.9,
                nextSteps: ['Ask for new task']
            };
        }
        return null;
    }
    async handleTemplateCreation(message, intent, _conversationHistory = []) {
        const templateData = this.extractTemplateData(message, _conversationHistory);
        const recentMessages = _conversationHistory.slice(-4);
        const hasTemplateContext = recentMessages.some((msg) => msg.role === 'assistant' && msg.content.includes('template'));
        if (intent.type === 'continue_template' && hasTemplateContext) {
            const lastAssistantMessage = [...recentMessages].reverse().find((msg) => msg.role === 'assistant');
            if (lastAssistantMessage && lastAssistantMessage.content.includes('subject line')) {
                templateData.subject = message;
                return {
                    message: `Perfect! Subject line "${message}" for template "${templateData.name || 'the template'}". What should the email content be?`,
                    confidence: 0.95,
                    nextSteps: ['Get content', 'Create template']
                };
            }
            else if (lastAssistantMessage && lastAssistantMessage.content.includes('content')) {
                templateData.content = message;
                try {
                    const templateResult = await this.createTemplateInDatabase({
                        name: templateData.name || 'test',
                        subject: templateData.subject || 'Test Subject',
                        htmlBody: `<h1>${templateData.subject || 'Test Subject'}</h1><p>${message}</p>`,
                        textBody: message
                    });
                    return {
                        message: `✅ **Template created successfully!**\n\n• **Name**: ${templateData.name || 'the template'}\n• **Subject**: ${templateData.subject || 'the subject'}\n• **Content**: ${message}\n\nTemplate ID: ${templateResult.template?.id || 'N/A'}\n\nThe template is now ready to use in your campaigns!`,
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
                        nextSteps: ['Template ready for campaigns', 'Create campaign with this template']
                    };
                }
                catch (error) {
                    return {
                        message: `❌ **Failed to create template**: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your system configuration and try again.`,
                        confidence: 0.8,
                        actions: [],
                        nextSteps: ['Try again', 'Check system configuration']
                    };
                }
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
                description: campaignData.description || `Campaign: ${campaignData.name}`
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
    async handleGeneralQuery(message, conversationHistory = []) {
        try {
            const contextualResponse = this.analyzeContextualResponse(message, conversationHistory);
            if (contextualResponse) {
                console.log('✅ Contextual response detected');
                return contextualResponse;
            }
            console.log('🔍 Searching RAG system for:', message);
            const ragResponse = await this.ragSystem.generateRAGResponse(message);
            if (ragResponse && ragResponse.answer) {
                console.log('✅ RAG system provided answer');
                const initialResponse = {
                    message: ragResponse.answer,
                    confidence: ragResponse.confidence || 0.8,
                    sources: ragResponse.sources || [],
                    nextSteps: ragResponse.nextSteps || []
                };
                console.log('🔗 Analyzing commands with Command Bridge...');
                const commands = this.commandBridge.analyzeResponse(initialResponse, message);
                if (commands.length > 0) {
                    console.log('🎯 Found actionable commands, executing...');
                    const executionResults = await this.commandBridge.executeCommands(commands);
                    return this.commandBridge.generateEnhancedResponse(initialResponse, commands, executionResults);
                }
                return initialResponse;
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
                    'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || 'b2fe12a463d743c6153dae74309b827774171551b699c5235981121a8fa279e5'
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
            const [templates, groups] = await Promise.all([
                this.getAvailableTemplates(),
                this.getAvailableAudienceGroups()
            ]);
            const firstTemplateId = templates.length > 0 ? templates[0].id : null;
            const firstGroupId = groups.length > 0 ? groups[0].id : null;
            console.log('📊 Campaign creation debug:', {
                templatesCount: templates.length,
                groupsCount: groups.length,
                firstTemplateId,
                firstGroupId,
                templates: templates.slice(0, 2),
                groups: groups.slice(0, 2)
            });
            if (!firstTemplateId) {
                throw new Error('No templates available. Please create a template first.');
            }
            if (!firstGroupId) {
                throw new Error('No audience groups available. Please create an audience group first.');
            }
            const response = await fetch(`${this.mainAppUrl}/api/internal/campaigns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || 'b2fe12a463d743c6153dae74309b827774171551b699c5235981121a8fa279e5'
                },
                body: JSON.stringify({
                    name: campaignData.name,
                    description: campaignData.description,
                    steps: campaignData.steps || [{
                            type: 'email',
                            templateId: firstTemplateId,
                            groupId: firstGroupId,
                            sendAt: null,
                            throttlePerMinute: 60
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
                    'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || 'b2fe12a463d743c6153dae74309b827774171551b699c5235981121a8fa279e5'
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
                    'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || 'b2fe12a463d743c6153dae74309b827774171551b699c5235981121a8fa279e5'
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
                    'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || 'b2fe12a463d743c6153dae74309b827774171551b699c5235981121a8fa279e5'
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
                    'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || 'b2fe12a463d743c6153dae74309b827774171551b699c5235981121a8fa279e5'
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
                    'X-AI-API-Key': process.env.AI_SERVICE_API_KEY || 'b2fe12a463d743c6153dae74309b827774171551b699c5235981121a8fa279e5'
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