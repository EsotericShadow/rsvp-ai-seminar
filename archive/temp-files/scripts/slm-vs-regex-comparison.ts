#!/usr/bin/env tsx

import { SLMAgent } from '../src/lib/agents/SLMAgent'
import { RAGDatabaseAgent } from '../src/lib/agents/RAGDatabaseAgent'

const testInputs = [
  "hey there! hows it going?",
  "can u help me creat a campain?",
  "I want to create a campaign called 'Summer Sale' for our VIP customers using the 'Promo Template' and schedule it for tomorrow morning",
  "creat a campain named 'Test Campain' for VIP custmers",
  "whats my audiance data?",
  "I need to send out a promotional email to our VIP members about the new product launch next week",
  "what are you capable of doing?",
  "is everything working properly?",
  "what campaigns do I have?",
  "do something useful",
  "i'm not sure what i need, can you help?",
  "HELLO!!! Can you CREATE a CAMPAIGN???",
  "create a campaign and show me my templates",
  "?"
]

async function compareAgents() {
  console.log('🎯 SLM vs REGEX AGENT COMPARISON')
  console.log('=====================================')
  
  const slmAgent = new SLMAgent()
  const regexAgent = new RAGDatabaseAgent()
  
  let slmPassed = 0
  let regexPassed = 0
  let total = testInputs.length
  
  for (let i = 0; i < testInputs.length; i++) {
    const input = testInputs[i]
    console.log(`\n📝 Test ${i + 1}: "${input}"`)
    
    try {
      // Test SLM Agent
      const slmResponse = await slmAgent.processMessage(input)
      const slmSuccess = slmResponse.confidence > 0.6 && 
                        (slmResponse.toolCalls.length > 0 || slmResponse.message.includes('help') || slmResponse.message.includes('Hello'))
      
      // Test Regex Agent
      const regexResponse = await regexAgent.processMessage(input)
      const regexSuccess = regexResponse.confidence > 0.6 && 
                          (regexResponse.toolCalls.length > 0 || regexResponse.message.includes('help') || regexResponse.message.includes('Hello'))
      
      console.log(`🤖 SLM: ${slmSuccess ? '✅' : '❌'} (${Math.round(slmResponse.confidence * 100)}% confidence)`)
      console.log(`🔧 Regex: ${regexSuccess ? '✅' : '❌'} (${Math.round(regexResponse.confidence * 100)}% confidence)`)
      
      if (slmSuccess) slmPassed++
      if (regexSuccess) regexPassed++
      
    } catch (error) {
      console.log(`❌ Error: ${error}`)
    }
  }
  
  console.log(`\n📊 FINAL COMPARISON:`)
  console.log(`🤖 SLM Agent: ${slmPassed}/${total} (${Math.round(slmPassed/total*100)}%)`)
  console.log(`🔧 Regex Agent: ${regexPassed}/${total} (${Math.round(regexPassed/total*100)}%)`)
  
  const improvement = slmPassed - regexPassed
  console.log(`\n🎉 SLM Agent is ${improvement > 0 ? '+' : ''}${improvement} tests better!`)
  
  if (improvement > 0) {
    console.log(`\n✨ Key Improvements with SLM Agent:`)
    console.log(`• Natural conversation understanding`)
    console.log(`• Typo tolerance and normalization`)
    console.log(`• Better entity extraction`)
    console.log(`• Semantic intent recognition`)
    console.log(`• Context-aware responses`)
  }
}

compareAgents()


