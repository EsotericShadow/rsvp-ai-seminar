export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}
export interface ExtractedEntity {
    type: string;
    value: string;
    confidence: number;
}
export interface AIResponse {
    message: string;
    confidence: number;
    sources?: any[];
    actions?: any[];
    toolCalls?: any[];
    toolResults?: any[];
    nextSteps?: string[];
}
export interface Intent {
    type: string;
    confidence: number;
    extractedData: any;
}
export interface TemplateData {
    name?: string;
    subject?: string;
    content?: string;
}
export interface CampaignData {
    name?: string;
    description?: string;
    steps?: any[];
}
export interface Context {
    messages: ChatMessage[];
    currentTask?: string;
}
//# sourceMappingURL=ai.d.ts.map