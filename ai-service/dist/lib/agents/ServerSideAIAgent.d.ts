import { ChatMessage, AIResponse, Intent, TemplateData, CampaignData } from '../../types/ai';
export declare class ServerSideAIAgent {
    private context;
    private mainAppUrl;
    private ragSystem;
    constructor();
    initializeKnowledgeBase(): Promise<void>;
    processMessage(userMessage: string, sessionId?: string, conversationHistory?: ChatMessage[]): Promise<AIResponse>;
    analyzeIntent(message: string, conversationHistory?: ChatMessage[]): Intent;
    extractTemplateData(message: string, conversationHistory?: ChatMessage[]): TemplateData;
    extractCampaignData(message: string, _conversationHistory?: ChatMessage[]): CampaignData;
    analyzeContextualResponse(message: string, conversationHistory?: ChatMessage[]): AIResponse | null;
    handleTemplateCreation(message: string, intent: Intent, _conversationHistory?: ChatMessage[]): Promise<AIResponse>;
    handleCampaignCreation(_message: string, intent: Intent, _conversationHistory?: ChatMessage[]): Promise<AIResponse>;
    handleGeneralQuery(message: string, conversationHistory?: ChatMessage[]): Promise<AIResponse>;
    createTemplateInDatabase(templateData: {
        name: string;
        subject: string;
        htmlBody: string;
        textBody?: string;
    }): Promise<any>;
    createCampaignInDatabase(campaignData: {
        name: string;
        description?: string;
        steps?: any[];
    }): Promise<any>;
    getAvailableTemplates(): Promise<any[]>;
    getAvailableAudienceGroups(): Promise<any[]>;
    createAudienceGroupInDatabase(groupData: any): Promise<any>;
    scheduleCampaignInDatabase(scheduleData: any): Promise<any>;
    sendCampaignInDatabase(sendData: any): Promise<any>;
}
//# sourceMappingURL=ServerSideAIAgent.d.ts.map