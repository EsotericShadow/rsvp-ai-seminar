/**
 * RAG Integration System for Juniper AI Agent
 * Provides comprehensive knowledge retrieval and context generation
 */

import weaviate from 'weaviate-ts-client';

export interface RAGSearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory: string;
  score: number;
  distance: number;
  properties: Record<string, any>;
}

export interface RAGContext {
  trainingData: RAGSearchResult[];
  codebase: RAGSearchResult[];
  brandContext: RAGSearchResult[];
  processes: RAGSearchResult[];
  apis: RAGSearchResult[];
  combinedContext: string;
}

export interface RAGResponse {
  answer: string;
  sources: RAGSearchResult[];
  confidence: number;
  relatedComponents: string[];
  nextSteps: string[];
}

class RAGIntegrationSystem {
  private weaviateClient: any;
  private collections: Record<string, string>;
  
  constructor() {
    // Initialize Weaviate client
    const weaviateUrl = process.env.WEAVIATE_URL;
    const weaviateApiKey = process.env.WEAVIATE_API_KEY;
    
    console.log('🔧 Initializing Weaviate client...');
    console.log('🔧 Weaviate URL:', weaviateUrl ? 'Set' : 'Not set');
    console.log('🔧 Weaviate API Key:', weaviateApiKey ? 'Set' : 'Not set');
    
    this.weaviateClient = weaviate.client({
      scheme: 'https',
      host: weaviateUrl || 'your-cluster.weaviate.network',
      apiKey: new weaviate.ApiKey(weaviateApiKey || 'your-api-key'),
    });
    
    this.collections = {
      trainingData: 'KnowledgeBase',
      codebase: 'KnowledgeBase',
      brandContext: 'BusinessData',
      processes: 'KnowledgeBase',
      apis: 'KnowledgeBase'
    };
    
    console.log('🔧 Weaviate client initialized');
  }
  
  /**
   * Perform comprehensive search across all collections
   */
  async searchAll(query: string, limitPerCollection: number = 3): Promise<RAGContext> {
    try {
      console.log('🔍 RAG searchAll called with query:', query);
      const [trainingData, codebase, brandContext, processes, apis] = await Promise.all([
        this.searchCollection(query, this.collections.trainingData, limitPerCollection),
        this.searchCollection(query, this.collections.codebase, limitPerCollection),
        this.searchCollection(query, this.collections.brandContext, limitPerCollection),
        this.searchCollection(query, this.collections.processes, limitPerCollection),
        this.searchCollection(query, this.collections.apis, limitPerCollection)
      ]);
      
      console.log('📊 RAG search results:', {
        trainingData: trainingData.length,
        codebase: codebase.length,
        brandContext: brandContext.length,
        processes: processes.length,
        apis: apis.length
      });
      
      // Combine all results into comprehensive context
      const combinedContext = this.generateCombinedContext({
        trainingData,
        codebase,
        brandContext,
        processes,
        apis
      });
      
      return {
        trainingData,
        codebase,
        brandContext,
        processes,
        apis,
        combinedContext
      };
    } catch (error) {
      console.error('Error in comprehensive search:', error);
      throw new Error('Failed to retrieve RAG context');
    }
  }
  
  /**
   * Search a specific collection
   */
  private async searchCollection(
    query: string, 
    collectionName: string, 
    limit: number
  ): Promise<RAGSearchResult[]> {
    try {
      console.log(`🔍 Searching collection ${collectionName} with query: "${query}"`);
      
      // Use REST API directly
      const response = await fetch(`https://${process.env.WEAVIATE_URL}/v1/objects?class=${collectionName}&limit=${limit}&bm25=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${process.env.WEAVIATE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`📋 Collection ${collectionName} response:`, data.objects?.length || 0, 'results');
      
      return (data.objects || []).map((item: any) => ({
        id: item.id,
        title: item.properties?.title || '',
        content: item.properties?.content || '',
        category: item.properties?.category || '',
        subcategory: item.properties?.subcategory || '',
        score: 0.8, // BM25 doesn't provide certainty scores
        distance: 0,
        properties: {
          title: item.properties?.title || '',
          content: item.properties?.content || '',
          category: item.properties?.category || '',
          subcategory: item.properties?.subcategory || '',
          source: item.properties?.source || '',
          createdBy: item.properties?.createdBy || '',
          metadata: item.properties?.metadata || '',
          tags: item.properties?.tags || []
        }
      }));
    } catch (error) {
      console.error(`❌ Error searching collection ${collectionName}:`, error);
      console.error(`❌ Error details:`, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        query: query,
        collectionName: collectionName,
        limit: limit
      });
      return [];
    }
  }
  
  /**
   * Generate combined context from all search results
   */
  private generateCombinedContext(context: Omit<RAGContext, 'combinedContext'>): string {
    const contextParts: string[] = [];
    
    // Add brand context first for context
    if (context.brandContext.length > 0) {
      contextParts.push('=== EVERGREEN BRAND CONTEXT ===');
      context.brandContext.forEach(doc => {
        contextParts.push(`Title: ${doc.title}`);
        contextParts.push(`Content: ${doc.content.substring(0, 500)}...`);
        contextParts.push('');
      });
    }
    
    // Add training data for specific functionality
    if (context.trainingData.length > 0) {
      contextParts.push('=== TRAINING DATA & FUNCTIONALITY ===');
      context.trainingData.forEach(doc => {
        contextParts.push(`Title: ${doc.title}`);
        contextParts.push(`Category: ${doc.category} - ${doc.subcategory}`);
        contextParts.push(`Content: ${doc.content.substring(0, 800)}...`);
        
        // Add specific code snippets if available
        if (doc.properties.code_snippets) {
          try {
            const snippets = JSON.parse(doc.properties.code_snippets);
            if (snippets.length > 0) {
              contextParts.push('Code Examples:');
              snippets.slice(0, 2).forEach((snippet: any) => {
                contextParts.push(`${snippet.purpose}: ${snippet.code.substring(0, 300)}...`);
              });
            }
          } catch (e) {
            // Ignore JSON parsing errors
          }
        }
        
        contextParts.push('');
      });
    }
    
    // Add codebase information
    if (context.codebase.length > 0) {
      contextParts.push('=== CODEBASE INFORMATION ===');
      context.codebase.forEach(doc => {
        contextParts.push(`File: ${doc.title}`);
        contextParts.push(`Content: ${doc.content.substring(0, 400)}...`);
        contextParts.push('');
      });
    }
    
    // Add process information
    if (context.processes.length > 0) {
      contextParts.push('=== PROCESSES & WORKFLOWS ===');
      context.processes.forEach(doc => {
        contextParts.push(`Process: ${doc.title}`);
        contextParts.push(`Description: ${doc.content.substring(0, 400)}...`);
        contextParts.push('');
      });
    }
    
    // Add API information
    if (context.apis.length > 0) {
      contextParts.push('=== API ENDPOINTS ===');
      context.apis.forEach(doc => {
        contextParts.push(`API: ${doc.title}`);
        contextParts.push(`Description: ${doc.content.substring(0, 400)}...`);
        contextParts.push('');
      });
    }
    
    return contextParts.join('\n');
  }
  
  /**
   * Generate AI response with RAG context
   */
  async generateResponse(query: string, context: RAGContext): Promise<RAGResponse> {
    try {
      // Prepare the prompt with context
      const prompt = this.buildPrompt(query, context);
      
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are Juniper, an AI assistant for Evergreen Web Solutions, helping Gabriel Lacroix manage email campaigns and analyze data. You have access to comprehensive knowledge about the RSVP application, including code, processes, and business context.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const answer = data.choices[0].message.content;
      
      // Extract related components and next steps
      const relatedComponents = this.extractRelatedComponents(context);
      const nextSteps = this.generateNextSteps(query, context);
      
      // Calculate confidence based on search scores
      const confidence = this.calculateConfidence(context);
      
      return {
        answer,
        sources: this.getAllSources(context),
        confidence,
        relatedComponents,
        nextSteps
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }
  
  /**
   * Build comprehensive prompt with context
   */
  private buildPrompt(query: string, context: RAGContext): string {
    return `
Context from the RSVP application knowledge base:

${context.combinedContext}

User Query: ${query}

Please provide a comprehensive, accurate response based on the context above. Include:

1. Direct answers to the user's question
2. Relevant code examples if applicable
3. Step-by-step processes if needed
4. Related components or APIs
5. Troubleshooting tips if relevant
6. Evergreen brand context when appropriate

Be specific, actionable, and maintain the professional tone of Evergreen Web Solutions. If you need to execute any commands or perform actions, explain what you would do and why.
`;
  }
  
  /**
   * Extract related components from context
   */
  private extractRelatedComponents(context: RAGContext): string[] {
    const components = new Set<string>();
    
    // Extract from all sources
    const allSources = this.getAllSources(context);
    
    allSources.forEach(source => {
      if (source.properties.related_components) {
        try {
          const related = JSON.parse(source.properties.related_components);
          related.forEach((comp: string) => components.add(comp));
        } catch (e) {
          // Ignore JSON parsing errors
        }
      }
      
      if (source.properties.related_apis) {
        try {
          const apis = JSON.parse(source.properties.related_apis);
          apis.forEach((api: string) => components.add(api));
        } catch (e) {
          // Ignore JSON parsing errors
        }
      }
    });
    
    return Array.from(components).slice(0, 10); // Limit to 10 components
  }
  
  /**
   * Generate next steps based on query and context
   */
  private generateNextSteps(query: string, context: RAGContext): string[] {
    const steps: string[] = [];
    
    // Analyze query intent
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('create') || queryLower.includes('add')) {
      steps.push('Review the creation process in the training data');
      steps.push('Check required parameters and validation rules');
      steps.push('Execute the creation command with proper data');
    }
    
    if (queryLower.includes('update') || queryLower.includes('modify')) {
      steps.push('Identify the target record or component');
      steps.push('Review update procedures and validation');
      steps.push('Apply changes with proper error handling');
    }
    
    if (queryLower.includes('delete') || queryLower.includes('remove')) {
      steps.push('Confirm the deletion is safe and necessary');
      steps.push('Check for dependencies and related data');
      steps.push('Execute deletion with proper cleanup');
    }
    
    if (queryLower.includes('analyze') || queryLower.includes('report')) {
      steps.push('Gather relevant data from the database');
      steps.push('Apply appropriate analysis methods');
      steps.push('Generate comprehensive report');
    }
    
    // Add general next steps
    steps.push('Verify the action was successful');
    steps.push('Update any related systems or caches');
    steps.push('Log the action for audit purposes');
    
    return steps.slice(0, 5); // Limit to 5 steps
  }
  
  /**
   * Calculate confidence score based on search results
   */
  private calculateConfidence(context: RAGContext): number {
    const allSources = this.getAllSources(context);
    
    if (allSources.length === 0) {
      return 0.1; // Low confidence if no sources
    }
    
    // Calculate average score
    const totalScore = allSources.reduce((sum, source) => sum + source.score, 0);
    const averageScore = totalScore / allSources.length;
    
    // Normalize to 0-1 range
    return Math.min(Math.max(averageScore, 0.1), 1.0);
  }
  
  /**
   * Get all sources from context
   */
  private getAllSources(context: RAGContext): RAGSearchResult[] {
    return [
      ...context.trainingData,
      ...context.codebase,
      ...context.brandContext,
      ...context.processes,
      ...context.apis
    ];
  }
  
  /**
   * Search for specific functionality
   */
  async searchFunctionality(functionality: string): Promise<RAGSearchResult[]> {
    const query = `${functionality} implementation code examples`;
    return this.searchCollection(query, this.collections.trainingData, 5);
  }
  
  /**
   * Search for API endpoints
   */
  async searchAPIs(endpoint?: string): Promise<RAGSearchResult[]> {
    const query = endpoint ? `API endpoint ${endpoint}` : 'API endpoints routes';
    return this.searchCollection(query, this.collections.apis, 5);
  }
  
  /**
   * Search for troubleshooting information
   */
  async searchTroubleshooting(issue: string): Promise<RAGSearchResult[]> {
    const query = `troubleshooting ${issue} error fix solution`;
    return this.searchCollection(query, this.collections.trainingData, 3);
  }
  
  /**
   * Get brand context for responses
   */
  async getBrandContext(): Promise<RAGSearchResult[]> {
    return this.searchCollection('Evergreen Web Solutions brand context', this.collections.brandContext, 3);
  }
}

// Export singleton instance
export const ragSystem = new RAGIntegrationSystem();

// Export utility functions
export async function searchRAG(query: string): Promise<RAGContext> {
  return ragSystem.searchAll(query);
}

export async function generateRAGResponse(query: string): Promise<RAGResponse> {
  const context = await ragSystem.searchAll(query);
  return ragSystem.generateResponse(query, context);
}

export async function searchFunctionality(functionality: string): Promise<RAGSearchResult[]> {
  return ragSystem.searchFunctionality(functionality);
}

export async function searchAPIs(endpoint?: string): Promise<RAGSearchResult[]> {
  return ragSystem.searchAPIs(endpoint);
}

export async function searchTroubleshooting(issue: string): Promise<RAGSearchResult[]> {
  return ragSystem.searchTroubleshooting(issue);
}

