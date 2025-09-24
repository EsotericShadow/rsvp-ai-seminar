/**
 * Query Enhancement System - Main entry point
 * Transforms generic queries into specific, detailed ones for better AI accuracy
 */

export { QueryPatternMatcher, queryPatternMatcher } from './query-pattern-matcher';
export { QueryEnhancer, queryEnhancer } from './query-enhancer';
export type { 
  QueryPattern, 
  QueryAnalysis 
} from './query-pattern-matcher';
export type { 
  EnhancedQuery, 
  EnhancementContext 
} from './query-enhancer';

import { QueryPatternMatcher, QueryAnalysis } from './query-pattern-matcher';
import { QueryEnhancer, EnhancedQuery } from './query-enhancer';

/**
 * Main Query Enhancement Service
 * Combines pattern matching and enhancement for complete query processing
 */
export class QueryEnhancementService {
  private patternMatcher: QueryPatternMatcher;
  private enhancer: QueryEnhancer;

  constructor() {
    this.patternMatcher = new QueryPatternMatcher();
    this.enhancer = new QueryEnhancer();
  }

  /**
   * Process a query through the complete enhancement pipeline
   */
  async processQuery(query: string): Promise<EnhancedQueryResult> {
    try {
      // Step 1: Analyze the query
      const analysis = this.patternMatcher.analyzeQuery(query);
      
      // Step 2: Enhance the query if needed
      let enhancedQuery: EnhancedQuery | null = null;
      if (analysis.enhancementNeeded) {
        enhancedQuery = this.enhancer.enhanceQuery(analysis);
      }

      // Step 3: Generate recommendations
      const recommendations = this.generateRecommendations(analysis, enhancedQuery);

      return {
        originalQuery: query,
        analysis,
        enhancedQuery,
        recommendations,
        processedAt: new Date().toISOString(),
        success: true
      };
    } catch (error) {
      return {
        originalQuery: query,
        analysis: {
          originalQuery: query,
          matchedPatterns: [],
          category: 'unknown',
          intent: 'unknown',
          confidence: 0,
          isGeneric: true,
          enhancementNeeded: true
        },
        enhancedQuery: null,
        recommendations: ['Query processing failed - using fallback'],
        processedAt: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate recommendations for query improvement
   */
  private generateRecommendations(analysis: QueryAnalysis, enhancedQuery: EnhancedQuery | null): string[] {
    const recommendations: string[] = [];

    if (analysis.isGeneric) {
      recommendations.push('Query is generic - consider using more specific terms');
    }

    if (analysis.confidence < 0.8) {
      recommendations.push('Low confidence match - try adding more context');
    }

    if (enhancedQuery) {
      recommendations.push('Query has been enhanced for better accuracy');
      
      if (enhancedQuery.confidence > 0.9) {
        recommendations.push('Enhanced query has high confidence for accurate results');
      }
    }

    if (analysis.matchedPatterns.length === 0) {
      recommendations.push('No patterns matched - try rephrasing the query');
    }

    // Category-specific recommendations
    switch (analysis.category) {
      case 'campaign_management':
        recommendations.push('For campaign operations, specify whether you want to create, update, delete, or list campaigns');
        break;
      case 'email_sending':
        recommendations.push('For email operations, specify the campaign, audience, or template details');
        break;
      case 'analytics':
        recommendations.push('For analytics, specify the time range, metrics, or dashboard type');
        break;
    }

    return recommendations;
  }

  /**
   * Get system statistics
   */
  getStats(): QueryEnhancementStats {
    const patternStats = {
      totalPatterns: this.patternMatcher.getCategories().length,
      categories: this.patternMatcher.getCategories()
    };

    const enhancementStats = this.enhancer.getEnhancementStats();

    return {
      patterns: patternStats,
      enhancements: enhancementStats,
      systemHealth: 'healthy'
    };
  }

  /**
   * Test the system with sample queries
   */
  async testSystem(): Promise<TestResult[]> {
    const testQueries = [
      'create campaign',
      'send email',
      'show analytics',
      'manage audience',
      'create a new campaign for tech companies',
      'send emails to my audience group',
      'show me campaign performance metrics'
    ];

    const results: TestResult[] = [];

    for (const query of testQueries) {
      const result = await this.processQuery(query);
      results.push({
        query,
        success: result.success,
        enhanced: !!result.enhancedQuery,
        confidence: result.analysis.confidence,
        category: result.analysis.category
      });
    }

    return results;
  }
}

/**
 * Result types
 */
export interface EnhancedQueryResult {
  originalQuery: string;
  analysis: QueryAnalysis;
  enhancedQuery: EnhancedQuery | null;
  recommendations: string[];
  processedAt: string;
  success: boolean;
  error?: string;
}

export interface QueryEnhancementStats {
  patterns: {
    totalPatterns: number;
    categories: string[];
  };
  enhancements: {
    totalRules: number;
    categories: string[];
    averageConfidence: number;
  };
  systemHealth: string;
}

export interface TestResult {
  query: string;
  success: boolean;
  enhanced: boolean;
  confidence: number;
  category: string;
}

// Export singleton instance
export const queryEnhancementService = new QueryEnhancementService();

