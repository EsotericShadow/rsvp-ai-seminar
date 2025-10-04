#!/usr/bin/env ts-node

/**
 * RAG System Validation Script
 * Tests Weaviate connection, collections, data ingestion, and search functionality
 */

import weaviate from 'weaviate-ts-client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface ValidationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

class RAGSystemValidator {
  private weaviateUrl: string | undefined;
  private weaviateApiKey: string | undefined;
  private weaviateClient: any;
  private results: ValidationResult[] = [];

  constructor() {
    this.weaviateUrl = process.env.WEAVIATE_URL;
    this.weaviateApiKey = process.env.WEAVIATE_API_KEY;
  }

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any) {
    this.results.push({ test, status, message, details });
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${emoji} ${test}: ${message}`);
    if (details) {
      console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }
  }

  async validateEnvironment(): Promise<void> {
    console.log('\n🔧 Validating Environment Configuration...\n');
    
    if (!this.weaviateUrl) {
      this.addResult('Environment Check', 'FAIL', 'WEAVIATE_URL not set in environment variables');
      return;
    }
    
    if (!this.weaviateApiKey) {
      this.addResult('Environment Check', 'FAIL', 'WEAVIATE_API_KEY not set in environment variables');
      return;
    }

    this.addResult('Environment Check', 'PASS', 'Environment variables configured', {
      url: this.weaviateUrl,
      hasApiKey: !!this.weaviateApiKey
    });
  }

  async validateConnection(): Promise<void> {
    console.log('\n🔗 Testing Weaviate Connection...\n');
    
    try {
      this.weaviateClient = weaviate.client({
        scheme: 'https',
        host: this.weaviateUrl!.replace('https://', ''),
        apiKey: new weaviate.ApiKey(this.weaviateApiKey!),
      });

      // Test connection by getting meta information
      const meta = await this.weaviateClient.misc.metaGetter().do();
      
      this.addResult('Weaviate Connection', 'PASS', 'Successfully connected to Weaviate', {
        version: meta.version,
        hostname: meta.hostname,
        modules: Object.keys(meta.modules || {})
      });
    } catch (error) {
      this.addResult('Weaviate Connection', 'FAIL', `Failed to connect to Weaviate: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        url: this.weaviateUrl,
        error: error
      });
    }
  }

  async validateCollections(): Promise<void> {
    console.log('\n📚 Checking Collections...\n');
    
    if (!this.weaviateClient) {
      this.addResult('Collections Check', 'FAIL', 'Weaviate client not initialized');
      return;
    }

    try {
      const schema = await this.weaviateClient.schema.getter().do();
      const collections = schema.classes?.map((c: any) => c.class) || [];
      
      const expectedCollections = ['KnowledgeBase', 'BusinessData'];
      const missingCollections = expectedCollections.filter(col => !collections.includes(col));
      
      if (missingCollections.length === 0) {
        this.addResult('Collections Check', 'PASS', 'All required collections exist', {
          collections: collections,
          expected: expectedCollections
        });
      } else {
        this.addResult('Collections Check', 'FAIL', `Missing collections: ${missingCollections.join(', ')}`, {
          existing: collections,
          missing: missingCollections
        });
      }

      // Check collection details
      for (const collectionName of expectedCollections) {
        if (collections.includes(collectionName)) {
          const collection = schema.classes.find((c: any) => c.class === collectionName);
          this.addResult(`Collection: ${collectionName}`, 'PASS', 'Collection exists with properties', {
            properties: collection.properties?.map((p: any) => p.name) || [],
            vectorizer: collection.vectorizer
          });
        }
      }
    } catch (error) {
      this.addResult('Collections Check', 'FAIL', `Failed to check collections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateDataIngestion(): Promise<void> {
    console.log('\n📊 Checking Data Ingestion...\n');
    
    if (!this.weaviateClient) {
      this.addResult('Data Ingestion Check', 'FAIL', 'Weaviate client not initialized');
      return;
    }

    try {
      // Check KnowledgeBase collection data
      const knowledgeBaseCount = await this.weaviateClient.aggregate
        .withClassName('KnowledgeBase')
        .withFields('meta { count }')
        .do();

      const kbCount = knowledgeBaseCount.data.Aggregate.KnowledgeBase?.[0]?.meta?.count || 0;
      
      if (kbCount > 0) {
        this.addResult('KnowledgeBase Data', 'PASS', `Found ${kbCount} entries in KnowledgeBase collection`);
        
        // Get sample entries
        const sampleEntries = await this.weaviateClient.query
          .get('KnowledgeBase', ['title', 'category', 'source', 'tags'])
          .withLimit(5)
          .do();

        this.addResult('KnowledgeBase Sample', 'PASS', 'Retrieved sample entries', {
          entries: sampleEntries.data.Get.KnowledgeBase?.map((entry: any) => ({
            title: entry.title,
            category: entry.category,
            source: entry.source,
            tags: entry.tags
          })) || []
        });
      } else {
        this.addResult('KnowledgeBase Data', 'FAIL', 'No data found in KnowledgeBase collection');
      }

      // Check BusinessData collection
      const businessDataCount = await this.weaviateClient.aggregate
        .withClassName('BusinessData')
        .withFields('meta { count }')
        .do();

      const bdCount = businessDataCount.data.Aggregate.BusinessData?.[0]?.meta?.count || 0;
      
      if (bdCount > 0) {
        this.addResult('BusinessData Data', 'PASS', `Found ${bdCount} entries in BusinessData collection`);
      } else {
        this.addResult('BusinessData Data', 'WARN', 'No data found in BusinessData collection (may be expected)');
      }

    } catch (error) {
      this.addResult('Data Ingestion Check', 'FAIL', `Failed to check data ingestion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateSearchFunctionality(): Promise<void> {
    console.log('\n🔍 Testing Search Functionality...\n');
    
    if (!this.weaviateClient) {
      this.addResult('Search Functionality', 'FAIL', 'Weaviate client not initialized');
      return;
    }

    const testQueries = [
      'template creation',
      'email campaigns',
      'Evergreen Web Solutions',
      'AI in Terrace event',
      'RSVP system capabilities'
    ];

    for (const query of testQueries) {
      try {
        console.log(`\n   Testing query: "${query}"`);
        
        // Test BM25 search
        const bm25Results = await this.weaviateClient.query
          .get('KnowledgeBase', ['title', 'content', 'category', 'source'])
          .withBm25({ query })
          .withLimit(3)
          .do();

        const results = bm25Results.data.Get.KnowledgeBase || [];
        
        if (results.length > 0) {
          this.addResult(`Search: "${query}"`, 'PASS', `Found ${results.length} results`, {
            results: results.map((r: any) => ({
              title: r.title,
              category: r.category,
              source: r.source,
              contentPreview: r.content?.substring(0, 100) + '...'
            }))
          });
        } else {
          this.addResult(`Search: "${query}"`, 'WARN', `No results found for query: "${query}"`);
        }
      } catch (error) {
        this.addResult(`Search: "${query}"`, 'FAIL', `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  async validateAIRAGIntegration(): Promise<void> {
    console.log('\n🤖 Testing AI RAG Integration...\n');
    
    try {
      // Import the RAG integration system
      const { RAGIntegrationSystem } = await import('../src/lib/rag-integration');
      
      const ragSystem = new RAGIntegrationSystem();
      
      // Test RAG response generation
      const testQuery = 'How can I create email templates?';
      console.log(`\n   Testing RAG response for: "${testQuery}"`);
      
      const ragResponse = await ragSystem.generateRAGResponse(testQuery);
      
      if (ragResponse && ragResponse.answer) {
        this.addResult('AI RAG Integration', 'PASS', 'RAG system generated response', {
          query: testQuery,
          answer: ragResponse.answer,
          confidence: ragResponse.confidence,
          sourcesCount: ragResponse.sources?.length || 0,
          nextSteps: ragResponse.nextSteps
        });
      } else {
        this.addResult('AI RAG Integration', 'FAIL', 'RAG system failed to generate response');
      }
      
    } catch (error) {
      this.addResult('AI RAG Integration', 'FAIL', `AI RAG integration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async runAllValidations(): Promise<void> {
    console.log('🚀 Starting RAG System Validation...\n');
    console.log('=' * 50);
    
    await this.validateEnvironment();
    await this.validateConnection();
    await this.validateCollections();
    await this.validateDataIngestion();
    await this.validateSearchFunctionality();
    await this.validateAIRAGIntegration();
    
    // Summary
    console.log('\n' + '=' * 50);
    console.log('📊 VALIDATION SUMMARY\n');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    
    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.filter(r => r.status === 'FAIL').forEach(result => {
        console.log(`   - ${result.test}: ${result.message}`);
      });
    }
    
    if (warnings > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.filter(r => r.status === 'WARN').forEach(result => {
        console.log(`   - ${result.test}: ${result.message}`);
      });
    }
    
    if (failed === 0) {
      console.log('\n🎉 All critical tests passed! RAG system is working correctly.');
    } else {
      console.log('\n💥 Some tests failed. Please check the issues above.');
      process.exit(1);
    }
  }
}

// Run the validation
async function main() {
  const validator = new RAGSystemValidator();
  await validator.runAllValidations();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Validation script failed:', error);
    process.exit(1);
  });
}

export { RAGSystemValidator };


