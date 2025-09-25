/**
 * Command Bridge System
 * Intelligently translates AI responses into actual system operations
 */

import { AIResponse } from '../types/ai';

export interface CommandAction {
  type: 'delete' | 'create' | 'update' | 'list' | 'import' | 'export';
  target: 'campaigns' | 'templates' | 'audiences' | 'businesses' | 'members';
  operation: string;
  parameters: Record<string, any>;
  apiEndpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export class CommandBridge {
  private mainAppUrl: string;
  private apiKey: string;

  constructor() {
    this.mainAppUrl = process.env.MAIN_APP_URL || 'https://rsvp.evergreenwebsolutions.ca';
    this.apiKey = process.env.AI_SERVICE_API_KEY || '';
  }

  /**
   * Analyze AI response and extract actionable commands
   */
  analyzeResponse(aiResponse: AIResponse, userMessage: string): CommandAction[] {
    const commands: CommandAction[] = [];
    const messageLower = userMessage.toLowerCase();
    const responseLower = aiResponse.message.toLowerCase();

    console.log('🔍 Command Bridge Analysis:', {
      userMessage: messageLower,
      responseContent: responseLower.substring(0, 100) + '...',
      sources: aiResponse.sources?.length || 0
    });

    // === DELETE OPERATIONS ===
    
    // Delete all campaigns
    if (messageLower.includes('delete all campaigns') || messageLower.includes('remove all campaigns')) {
      commands.push({
        type: 'delete',
        target: 'campaigns',
        operation: 'delete_all_campaigns',
        parameters: {},
        apiEndpoint: '/api/internal/campaigns/delete-all',
        method: 'DELETE'
      });
    }

    // Delete all phony business entries
    if (messageLower.includes('delete all phony business entries') || 
        messageLower.includes('remove phony businesses') ||
        messageLower.includes('clean up phony data')) {
      commands.push({
        type: 'delete',
        target: 'businesses',
        operation: 'delete_phony_businesses',
        parameters: { filter: 'phony' },
        apiEndpoint: '/api/internal/businesses/delete-phony',
        method: 'DELETE'
      });
    }

    // Delete specific campaigns
    if (messageLower.includes('delete campaign') && !messageLower.includes('all')) {
      const campaignName = this.extractCampaignName(messageLower);
      if (campaignName) {
        commands.push({
          type: 'delete',
          target: 'campaigns',
          operation: 'delete_campaign',
          parameters: { name: campaignName },
          apiEndpoint: '/api/internal/campaigns/delete',
          method: 'DELETE'
        });
      }
    }

    // === CREATE OPERATIONS ===
    
    // Create template
    if (messageLower.includes('create template') || messageLower.includes('new template')) {
      commands.push({
        type: 'create',
        target: 'templates',
        operation: 'create_template',
        parameters: { name: this.extractTemplateName(messageLower) },
        apiEndpoint: '/api/internal/templates',
        method: 'POST'
      });
    }

    // Create campaign
    if (messageLower.includes('create campaign') || messageLower.includes('new campaign')) {
      commands.push({
        type: 'create',
        target: 'campaigns',
        operation: 'create_campaign',
        parameters: { name: this.extractCampaignName(messageLower) },
        apiEndpoint: '/api/internal/campaigns',
        method: 'POST'
      });
    }

    // Create audience group
    if (messageLower.includes('create audience') || messageLower.includes('new audience')) {
      commands.push({
        type: 'create',
        target: 'audiences',
        operation: 'create_audience_group',
        parameters: { name: this.extractAudienceName(messageLower) },
        apiEndpoint: '/api/internal/groups',
        method: 'POST'
      });
    }

    // === LIST OPERATIONS ===
    
    // List campaigns
    if (messageLower.includes('list campaigns') || messageLower.includes('show campaigns')) {
      commands.push({
        type: 'list',
        target: 'campaigns',
        operation: 'list_campaigns',
        parameters: {},
        apiEndpoint: '/api/internal/campaigns',
        method: 'GET'
      });
    }

    // List templates
    if (messageLower.includes('list templates') || messageLower.includes('show templates')) {
      commands.push({
        type: 'list',
        target: 'templates',
        operation: 'list_templates',
        parameters: {},
        apiEndpoint: '/api/internal/templates',
        method: 'GET'
      });
    }

    // List audiences
    if (messageLower.includes('list audiences') || messageLower.includes('show audiences')) {
      commands.push({
        type: 'list',
        target: 'audiences',
        operation: 'list_audiences',
        parameters: {},
        apiEndpoint: '/api/internal/groups',
        method: 'GET'
      });
    }

    // List businesses
    if (messageLower.includes('list businesses') || messageLower.includes('show businesses')) {
      commands.push({
        type: 'list',
        target: 'businesses',
        operation: 'list_businesses',
        parameters: {},
        apiEndpoint: '/api/internal/businesses',
        method: 'GET'
      });
    }

    console.log('🎯 Extracted Commands:', commands);
    return commands;
  }

  /**
   * Execute a command action
   */
  async executeCommand(command: CommandAction): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('🚀 Executing Command:', command);

      const url = `${this.mainAppUrl}${command.apiEndpoint}`;
      const options: RequestInit = {
        method: command.method,
        headers: {
          'Content-Type': 'application/json',
          'X-AI-API-Key': this.apiKey
        }
      };

      if (command.method !== 'GET' && Object.keys(command.parameters).length > 0) {
        options.body = JSON.stringify(command.parameters);
      }

      const response = await fetch(url, options);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Command executed successfully:', data);
        return { success: true, data };
      } else {
        const error = await response.text();
        console.error('❌ Command execution failed:', response.status, error);
        return { success: false, error: `HTTP ${response.status}: ${error}` };
      }
    } catch (error) {
      console.error('❌ Command execution error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Execute multiple commands in sequence
   */
  async executeCommands(commands: CommandAction[]): Promise<Array<{ success: boolean; data?: any; error?: string }>> {
    const results = [];
    
    for (const command of commands) {
      const result = await this.executeCommand(command);
      results.push(result);
      
      // Add small delay between commands
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  /**
   * Generate enhanced AI response with command execution results
   */
  generateEnhancedResponse(
    originalResponse: AIResponse, 
    commands: CommandAction[], 
    executionResults: Array<{ success: boolean; data?: any; error?: string }>
  ): AIResponse {
    let enhancedMessage = originalResponse.message;
    
    if (commands.length > 0) {
      enhancedMessage += '\n\n**Executing Commands:**\n';
      
      commands.forEach((command, index) => {
        const result = executionResults[index];
        const status = result.success ? '✅' : '❌';
        enhancedMessage += `${status} ${command.operation}: ${result.success ? 'Success' : result.error}\n`;
      });
    }
    
    return {
      ...originalResponse,
      message: enhancedMessage,
      actions: commands.map(cmd => ({
        type: cmd.operation,
        data: cmd.parameters
      }))
    };
  }

  // Helper methods for extracting parameters from user messages
  private extractCampaignName(message: string): string | null {
    const match = message.match(/campaign[:\s]+([^,.\n]+)/i);
    return match ? match[1].trim() : null;
  }

  private extractTemplateName(message: string): string | null {
    const match = message.match(/template[:\s]+([^,.\n]+)/i);
    return match ? match[1].trim() : null;
  }

  private extractAudienceName(message: string): string | null {
    const match = message.match(/audience[:\s]+([^,.\n]+)/i);
    return match ? match[1].trim() : null;
  }
}
