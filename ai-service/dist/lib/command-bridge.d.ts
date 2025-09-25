import { AIResponse } from '../types/ai';
export interface CommandAction {
    type: 'delete' | 'create' | 'update' | 'list' | 'import' | 'export';
    target: 'campaigns' | 'templates' | 'audiences' | 'businesses' | 'members';
    operation: string;
    parameters: Record<string, any>;
    apiEndpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}
export declare class CommandBridge {
    private mainAppUrl;
    private apiKey;
    constructor();
    analyzeResponse(aiResponse: AIResponse, userMessage: string): CommandAction[];
    executeCommand(command: CommandAction): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    executeCommands(commands: CommandAction[]): Promise<Array<{
        success: boolean;
        data?: any;
        error?: string;
    }>>;
    generateEnhancedResponse(originalResponse: AIResponse, commands: CommandAction[], executionResults: Array<{
        success: boolean;
        data?: any;
        error?: string;
    }>): AIResponse;
    private extractCampaignName;
    private extractTemplateName;
    private extractAudienceName;
}
//# sourceMappingURL=command-bridge.d.ts.map