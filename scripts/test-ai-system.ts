#!/usr/bin/env tsx

import { RAGDatabaseAgent } from '../src/lib/agents/RAGDatabaseAgent'

async function testAISystem() {
  console.log('🤖 Testing complete AI system...')
  
  const agent = new RAGDatabaseAgent()
  
  const testMessages = [
    'Hi Juniper!',
    'How do I create a new campaign?',
    'Show me the system status',
    'What templates are available?',
    'Create a campaign named "Test Campaign" for "VIP customers" using "Welcome Template" scheduled for "tomorrow"'
  ]
  
  for (const message of testMessages) {
    console.log(`\n👤 User: "${message}"`)
    
    try {
      const response = await agent.processMessage(message)
      
      console.log(`🤖 Juniper: ${response.message}`)
      
      if (response.toolCalls && response.toolCalls.length > 0) {
        console.log(`🔧 Tools executed: ${response.toolCalls.length}`)
        response.toolCalls.forEach((tool, i) => {
          console.log(`  ${i + 1}. ${tool.name} (${tool.status})`)
        })
      }
      
      if (response.toolResults && response.toolResults.length > 0) {
        console.log(`📊 Results: ${response.toolResults.length}`)
        response.toolResults.forEach((result, i) => {
          console.log(`  ${i + 1}. ${result.success ? '✅' : '❌'} ${result.success ? 'Success' : result.error}`)
        })
      }
      
      if (response.suggestions && response.suggestions.length > 0) {
        console.log(`💡 Suggestions: ${response.suggestions.slice(0, 3).join(', ')}`)
      }
      
    } catch (error) {
      console.error(`❌ Error:`, error)
    }
  }
  
  console.log('\n✅ AI system testing complete!')
}

testAISystem()


