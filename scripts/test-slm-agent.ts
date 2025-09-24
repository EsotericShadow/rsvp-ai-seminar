#!/usr/bin/env tsx

import { SLMAgent } from '../src/lib/agents/SLMAgent'

interface TestCase {
  category: string
  description: string
  input: string
  expectedBehavior: {
    shouldExecuteTools: boolean
    shouldAskForDetails: boolean
    shouldProvideHelp: boolean
    shouldAdmitUncertainty: boolean
    minConfidence: number
    maxConfidence: number
    expectedIntent?: string
    expectedEntities?: string[]
  }
}

const testCases: TestCase[] = [
  // === NATURAL CONVERSATION ===
  {
    category: "Natural Conversation",
    description: "Casual greeting with typos",
    input: "hey there! hows it going?",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: false,
      shouldProvideHelp: true,
      shouldAdmitUncertainty: false,
      minConfidence: 0.7,
      maxConfidence: 1.0,
      expectedIntent: "greeting"
    }
  },
  {
    category: "Natural Conversation",
    description: "Help request with typos",
    input: "can u help me creat a campain?",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: true,
      shouldProvideHelp: true,
      shouldAdmitUncertainty: false,
      minConfidence: 0.7,
      maxConfidence: 1.0,
      expectedIntent: "create_campaign"
    }
  },
  {
    category: "Natural Conversation",
    description: "Natural language campaign creation",
    input: "I want to create a campaign called 'Summer Sale' for our VIP customers using the 'Promo Template' and schedule it for tomorrow morning",
    expectedBehavior: {
      shouldExecuteTools: true,
      shouldAskForDetails: false,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0,
      expectedIntent: "create_campaign",
      expectedEntities: ["campaign_name", "audience_group", "template_name", "schedule"]
    }
  },

  // === TYPO TOLERANCE ===
  {
    category: "Typo Tolerance",
    description: "Campaign with typos",
    input: "creat a campain named 'Test Campain' for VIP custmers",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: true,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.6,
      maxConfidence: 0.9,
      expectedIntent: "create_campaign",
      expectedEntities: ["campaign_name", "audience_group"]
    }
  },
  {
    category: "Typo Tolerance",
    description: "Template with typos",
    input: "show me my templates",
    expectedBehavior: {
      shouldExecuteTools: true,
      shouldAskForDetails: false,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0,
      expectedIntent: "show_templates"
    }
  },
  {
    category: "Typo Tolerance",
    description: "Audience with typos",
    input: "whats my audiance data?",
    expectedBehavior: {
      shouldExecuteTools: true,
      shouldAskForDetails: false,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0,
      expectedIntent: "show_audience"
    }
  },

  // === SEMANTIC UNDERSTANDING ===
  {
    category: "Semantic Understanding",
    description: "Implicit campaign creation",
    input: "I need to send out a promotional email to our VIP members about the new product launch next week",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: true,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.6,
      maxConfidence: 0.9,
      expectedIntent: "create_campaign",
      expectedEntities: ["audience_group", "schedule"]
    }
  },
  {
    category: "Semantic Understanding",
    description: "Question about capabilities",
    input: "what are you capable of doing?",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: false,
      shouldProvideHelp: true,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0,
      expectedIntent: "help_request"
    }
  },
  {
    category: "Semantic Understanding",
    description: "Status inquiry",
    input: "is everything working properly?",
    expectedBehavior: {
      shouldExecuteTools: true,
      shouldAskForDetails: false,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0,
      expectedIntent: "system_status"
    }
  },

  // === CONVERSATIONAL FLOW ===
  {
    category: "Conversational Flow",
    description: "Follow-up question",
    input: "what campaigns do I have?",
    expectedBehavior: {
      shouldExecuteTools: true,
      shouldAskForDetails: false,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0,
      expectedIntent: "show_campaigns"
    }
  },
  {
    category: "Conversational Flow",
    description: "Vague request",
    input: "do something useful",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: true,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: true,
      minConfidence: 0.3,
      maxConfidence: 0.6,
      expectedIntent: "vague_request"
    }
  },
  {
    category: "Conversational Flow",
    description: "Contraction and informal language",
    input: "i'm not sure what i need, can you help?",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: false,
      shouldProvideHelp: true,
      shouldAdmitUncertainty: false,
      minConfidence: 0.7,
      maxConfidence: 1.0,
      expectedIntent: "help_request"
    }
  },

  // === EDGE CASES ===
  {
    category: "Edge Cases",
    description: "Mixed case and punctuation",
    input: "HELLO!!! Can you CREATE a CAMPAIGN???",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: true,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.6,
      maxConfidence: 0.9,
      expectedIntent: "create_campaign"
    }
  },
  {
    category: "Edge Cases",
    description: "Multiple intents in one message",
    input: "create a campaign and show me my templates",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: true,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.4,
      maxConfidence: 0.7,
      expectedIntent: "create_campaign"
    }
  },
  {
    category: "Edge Cases",
    description: "Empty or minimal input",
    input: "?",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: true,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: true,
      minConfidence: 0.2,
      maxConfidence: 0.5,
      expectedIntent: "vague_request"
    }
  }
]

async function runSLMTest(testCase: TestCase, agent: SLMAgent): Promise<{
  passed: boolean
  issues: string[]
  response: any
}> {
  console.log(`\n🧪 ${testCase.category}: ${testCase.description}`)
  console.log(`📝 Input: "${testCase.input}"`)
  
  const response = await agent.processMessage(testCase.input)
  const issues: string[] = []
  
  // Check intent
  if (testCase.expectedBehavior.expectedIntent && response.intent !== testCase.expectedBehavior.expectedIntent) {
    issues.push(`Expected intent "${testCase.expectedBehavior.expectedIntent}" but got "${response.intent}"`)
  }
  
  // Check entities
  if (testCase.expectedBehavior.expectedEntities) {
    const responseEntityTypes = response.entities?.map((e: any) => e.type) || []
    const missingEntities = testCase.expectedBehavior.expectedEntities.filter(
      expected => !responseEntityTypes.includes(expected)
    )
    if (missingEntities.length > 0) {
      issues.push(`Missing expected entities: ${missingEntities.join(', ')}`)
    }
  }
  
  // Check tool execution
  if (testCase.expectedBehavior.shouldExecuteTools && response.toolCalls.length === 0) {
    issues.push('Should execute tools but does not')
  } else if (!testCase.expectedBehavior.shouldExecuteTools && response.toolCalls.length > 0) {
    issues.push('Should not execute tools but does')
  }
  
  // Check confidence levels
  if (response.confidence < testCase.expectedBehavior.minConfidence) {
    issues.push(`Confidence too low: ${response.confidence} < ${testCase.expectedBehavior.minConfidence}`)
  }
  if (response.confidence > testCase.expectedBehavior.maxConfidence) {
    issues.push(`Confidence too high: ${response.confidence} > ${testCase.expectedBehavior.maxConfidence}`)
  }
  
  // Check for help response
  if (testCase.expectedBehavior.shouldProvideHelp) {
    const hasHelp = response.message.includes('I can help you with') || 
                   response.message.includes('capabilities') ||
                   response.message.includes('What would you like to work on')
    if (!hasHelp) {
      issues.push('Should provide help but does not')
    }
  }
  
  // Check for detail requests
  if (testCase.expectedBehavior.shouldAskForDetails) {
    const asksForDetails = response.message.includes('need more specific') ||
                          response.message.includes('Please provide') ||
                          response.message.includes('more details') ||
                          response.message.includes('I need some details')
    if (!asksForDetails) {
      issues.push('Should ask for details but does not')
    }
  }
  
  // Check for uncertainty admission
  if (testCase.expectedBehavior.shouldAdmitUncertainty) {
    const admitsUncertainty = response.message.includes('not sure') ||
                             response.message.includes('uncertain') ||
                             response.message.includes('⚠️') ||
                             response.message.includes('Could you be more specific')
    if (!admitsUncertainty) {
      issues.push('Should admit uncertainty but does not')
    }
  }
  
  const passed = issues.length === 0
  
  console.log(`🤖 Response: ${response.message.substring(0, 150)}...`)
  console.log(`📊 Confidence: ${Math.round(response.confidence * 100)}%`)
  console.log(`🎯 Intent: ${response.intent}`)
  console.log(`🔧 Tools: ${response.toolCalls.length}`)
  if (response.entities && response.entities.length > 0) {
    console.log(`🏷️  Entities: ${response.entities.map((e: any) => `${e.type}:${e.value}`).join(', ')}`)
  }
  console.log(`✅ Passed: ${passed}`)
  
  if (issues.length > 0) {
    console.log(`❌ Issues: ${issues.join(', ')}`)
  }
  
  return { passed, issues, response }
}

async function runSLMComprehensiveTests() {
  console.log('🎯 SLM AGENT COMPREHENSIVE TESTING')
  console.log('=====================================')
  
  const agent = new SLMAgent()
  let passedTests = 0
  let totalTests = testCases.length
  const categoryResults: { [key: string]: { passed: number, total: number } } = {}
  
  for (const testCase of testCases) {
    const result = await runSLMTest(testCase, agent)
    
    if (result.passed) {
      passedTests++
    }
    
    // Track by category
    if (!categoryResults[testCase.category]) {
      categoryResults[testCase.category] = { passed: 0, total: 0 }
    }
    categoryResults[testCase.category].total++
    if (result.passed) {
      categoryResults[testCase.category].passed++
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  
  console.log(`\n📊 OVERALL RESULTS:`)
  console.log(`✅ Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`)
  
  console.log(`\n📈 RESULTS BY CATEGORY:`)
  Object.entries(categoryResults).forEach(([category, results]) => {
    const percentage = Math.round(results.passed / results.total * 100)
    console.log(`  ${category}: ${results.passed}/${results.total} (${percentage}%)`)
  })
  
  console.log(`\n🎉 SLM Agent testing complete!`)
  
  return {
    passedTests,
    totalTests,
    passRate: passedTests / totalTests,
    categoryResults
  }
}

runSLMComprehensiveTests()


