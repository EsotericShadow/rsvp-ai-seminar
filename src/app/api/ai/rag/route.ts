import { NextRequest, NextResponse } from 'next/server'
import { knowledgeIngestion } from '@/lib/weaviate/knowledgeIngestion'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Search knowledge base
    const knowledgeResults = await knowledgeIngestion.searchKnowledge(query, 3)
    
    // Search business data
    const businessResults = await knowledgeIngestion.searchBusinessData(query, 2)

    // Combine and format results
    const context = {
      knowledge: knowledgeResults,
      businessData: businessResults,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({ 
      context: JSON.stringify(context, null, 2),
      results: {
        knowledgeCount: knowledgeResults.length,
        businessCount: businessResults.length
      }
    })

  } catch (error) {
    console.error('RAG API error:', error)
    return NextResponse.json({ 
      error: 'Failed to search knowledge base',
      context: 'No relevant context found.'
    }, { status: 500 })
  }
}