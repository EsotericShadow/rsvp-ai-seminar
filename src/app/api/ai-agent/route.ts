import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminSession';
import { generateRAGResponse, searchRAG, searchFunctionality, searchAPIs, searchTroubleshooting } from '@/lib/rag-integration';
import { AIEnhancementService, getFallbackKnowledge } from '@/lib/ai-enhancement';

export async function POST(req: NextRequest) {
  try {
    // Enhanced JSON parsing with better error handling (before auth check)
    let body;
    try {
      const text = await req.text();
      if (!text || text.trim() === '') {
        return NextResponse.json(
          { error: 'Request body is empty' },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid JSON format',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
          suggestion: 'Please ensure your request body contains valid JSON'
        },
        { status: 400 }
      );
    }

    // Enhanced input validation (before auth check)
    const { query, action, context } = body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Query is required and must be a non-empty string',
          received: typeof query,
          suggestion: 'Please provide a valid query string'
        },
        { status: 400 }
      );
    }

    if (query.length > 10000) {
      return NextResponse.json(
        { 
          error: 'Query is too long',
          maxLength: 10000,
          receivedLength: query.length,
          suggestion: 'Please shorten your query to under 10,000 characters'
        },
        { status: 400 }
      );
    }

    // Validate action parameter
    const validActions = ['search', 'functionality', 'api', 'troubleshoot', 'chat'];
    if (action && !validActions.includes(action)) {
      return NextResponse.json(
        { 
          error: 'Invalid action parameter',
          validActions,
          received: action,
          suggestion: 'Please use one of the valid action types'
        },
        { status: 400 }
      );
    }

    // Check admin authentication (after input validation)
    const auth = requireAdminSession();
    if ('response' in auth) return auth.response;

    // STEP 1: Enhance the query if it's generic
    console.log('🔍 Original query:', query);
    const enhancementResult = await AIEnhancementService.processQuery(query);
    const finalQuery = enhancementResult.enhancedQuery;
    
    if (enhancementResult.enhancementApplied) {
      console.log('✅ Query enhanced:', finalQuery.substring(0, 100) + '...');
    } else {
      console.log('ℹ️ Query already specific, no enhancement needed');
    }

    // STEP 2: Process with existing RAG system (with fallback)
    let response;
    try {
      switch (action) {
        case 'search':
          response = await handleSearch(finalQuery, context);
          break;
        case 'functionality':
          response = await handleFunctionalitySearch(finalQuery);
          break;
        case 'api':
          response = await handleAPISearch(finalQuery);
          break;
        case 'troubleshoot':
          response = await handleTroubleshooting(finalQuery);
          break;
        case 'chat':
        default:
          response = await handleChat(finalQuery);
          break;
      }
    } catch (error) {
      console.log('⚠️ RAG system failed, using fallback knowledge:', error instanceof Error ? error.message : String(error));
      // Use fallback knowledge when RAG system fails
      const fallbackAnswer = getFallbackKnowledge(finalQuery);
      response = {
        type: 'chat',
        answer: fallbackAnswer,
        confidence: 0.8,
        sources: [],
        relatedComponents: [],
        nextSteps: ['RAG system unavailable - using fallback knowledge'],
        timestamp: new Date().toISOString(),
        fallback: true
      };
    }

    // STEP 3: Validate the response
    const responseString = JSON.stringify(response);
    const validation = AIEnhancementService.validateResponse(responseString);
    
    console.log('🛡️ Response validation:', {
      isValid: validation.isValid,
      confidence: validation.confidence,
      issues: validation.issues.length
    });

    // STEP 4: Return validated response with metadata
    return NextResponse.json({
      ...response,
      metadata: {
        originalQuery: query,
        enhancedQuery: enhancementResult.enhancedQuery,
        enhancementApplied: enhancementResult.enhancementApplied,
        enhancementReasoning: enhancementResult.reasoning,
        validation: {
          isValid: validation.isValid,
          confidence: validation.confidence,
          issues: validation.issues,
          suggestions: validation.isValid ? ['Response is valid and safe to execute'] : ['Response contains issues - review before execution']
        },
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Agent API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleChat(query: string) {
  try {
    const ragResponse = await generateRAGResponse(query);
    
    return {
      type: 'chat',
      answer: ragResponse.answer,
      confidence: ragResponse.confidence,
      sources: ragResponse.sources.map(source => ({
        title: source.title,
        category: source.category,
        score: source.score
      })),
      relatedComponents: ragResponse.relatedComponents,
      nextSteps: ragResponse.nextSteps,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in chat handler:', error);
    return {
      type: 'chat',
      answer: 'I apologize, but I encountered an error while processing your request. Please try again.',
      confidence: 0.1,
      sources: [],
      relatedComponents: [],
      nextSteps: ['Try rephrasing your question', 'Check if the system is properly configured'],
      timestamp: new Date().toISOString()
    };
  }
}

async function handleSearch(query: string, context?: any) {
  try {
    const ragContext = await searchRAG(query);
    
    return {
      type: 'search',
      query,
      results: {
        trainingData: ragContext.trainingData.map(result => ({
          title: result.title,
          category: result.category,
          subcategory: result.subcategory,
          score: result.score,
          preview: result.content.substring(0, 200) + '...'
        })),
        codebase: ragContext.codebase.map(result => ({
          title: result.title,
          category: result.category,
          score: result.score,
          preview: result.content.substring(0, 200) + '...'
        })),
        brandContext: ragContext.brandContext.map(result => ({
          title: result.title,
          category: result.category,
          score: result.score,
          preview: result.content.substring(0, 200) + '...'
        })),
        processes: ragContext.processes.map(result => ({
          title: result.title,
          category: result.category,
          score: result.score,
          preview: result.content.substring(0, 200) + '...'
        })),
        apis: ragContext.apis.map(result => ({
          title: result.title,
          category: result.category,
          score: result.score,
          preview: result.content.substring(0, 200) + '...'
        }))
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in search handler:', error);
    return {
      type: 'search',
      query,
      results: {
        trainingData: [],
        codebase: [],
        brandContext: [],
        processes: [],
        apis: []
      },
      error: 'Search failed',
      timestamp: new Date().toISOString()
    };
  }
}

async function handleFunctionalitySearch(functionality: string) {
  try {
    const results = await searchFunctionality(functionality);
    
    return {
      type: 'functionality',
      functionality,
      results: results.map(result => ({
        title: result.title,
        category: result.category,
        subcategory: result.subcategory,
        score: result.score,
        codeSnippets: result.properties.code_snippets ? 
          JSON.parse(result.properties.code_snippets) : [],
        processes: result.properties.processes ? 
          JSON.parse(result.properties.processes) : [],
        usageExamples: result.properties.usage_examples ? 
          JSON.parse(result.properties.usage_examples) : []
      })),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in functionality search:', error);
    return {
      type: 'functionality',
      functionality,
      results: [],
      error: 'Functionality search failed',
      timestamp: new Date().toISOString()
    };
  }
}

async function handleAPISearch(endpoint?: string) {
  try {
    const results = await searchAPIs(endpoint);
    
    return {
      type: 'api',
      endpoint,
      results: results.map(result => ({
        title: result.title,
        category: result.category,
        score: result.score,
        description: result.content.substring(0, 300) + '...',
        relatedAPIs: result.properties.related_apis ? 
          JSON.parse(result.properties.related_apis) : []
      })),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in API search:', error);
    return {
      type: 'api',
      endpoint,
      results: [],
      error: 'API search failed',
      timestamp: new Date().toISOString()
    };
  }
}

async function handleTroubleshooting(issue: string) {
  try {
    const results = await searchTroubleshooting(issue);
    
    return {
      type: 'troubleshoot',
      issue,
      results: results.map(result => ({
        title: result.title,
        category: result.category,
        score: result.score,
        troubleshooting: result.properties.troubleshooting ? 
          JSON.parse(result.properties.troubleshooting) : [],
        content: result.content.substring(0, 500) + '...'
      })),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in troubleshooting search:', error);
    return {
      type: 'troubleshoot',
      issue,
      results: [],
      error: 'Troubleshooting search failed',
      timestamp: new Date().toISOString()
    };
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Test RAG system connectivity
    const testQuery = 'test connection';
    const ragContext = await searchRAG(testQuery);
    
    return NextResponse.json({
      status: 'healthy',
      ragSystem: 'connected',
      collections: {
        trainingData: ragContext.trainingData.length,
        codebase: ragContext.codebase.length,
        brandContext: ragContext.brandContext.length,
        processes: ragContext.processes.length,
        apis: ragContext.apis.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Agent health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'RAG system connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

