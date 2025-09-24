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
export declare class RAGIntegrationSystem {
    private weaviateUrl;
    private weaviateApiKey;
    private weaviateClient;
    constructor();
    initializeKnowledgeBase(): Promise<void>;
    ensureCollectionsExist(): Promise<void>;
    createKnowledgeBaseCollection(): Promise<void>;
    createBusinessDataCollection(): Promise<void>;
    ingestKnowledgeData(): Promise<void>;
    generateRAGResponse(query: string): Promise<RAGResponse>;
    searchRAG(query: string): Promise<RAGContext>;
    searchCollection(collectionName: string, query: string, limit?: number): Promise<RAGSearchResult[]>;
    generateAnswerFromContext(query: string, _context: RAGContext): string;
    combineContext(_context: RAGContext): string;
    extractSources(_context: RAGContext): RAGSearchResult[];
    extractRelatedComponents(_context: RAGContext): string[];
    generateNextSteps(query: string, _context: RAGContext): string[];
    getFallbackResponse(_query: string): RAGResponse;
}
//# sourceMappingURL=rag-integration.d.ts.map