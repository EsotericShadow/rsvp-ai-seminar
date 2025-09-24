#!/usr/bin/env tsx

import { RAGDatabaseAgent } from '../src/lib/agents/RAGDatabaseAgent'

interface UseCaseTest {
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
  }
}

const useCaseTests: UseCaseTest[] = [
  // === BASIC INTERACTION ===
  {
    category: "Basic Interaction",
    description: "Simple greeting",
    input: "hello",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: false,
      shouldProvideHelp: true,
      shouldAdmitUncertainty: false,
      minConfidence: 0.7,
      maxConfidence: 1.0
    }
  },
  {
    category: "Basic Interaction", 
    description: "General help request",
    input: "help",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: false,
      shouldProvideHelp: true,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0
    }
  },
  {
    category: "Basic Interaction",
    description: "Capabilities inquiry",
    input: "what can you do?",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: false,
      shouldProvideHelp: true,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0
    }
  },

  // === CAMPAIGN CREATION ===
  {
    category: "Campaign Creation",
    description: "Vague campaign request",
    input: "create campaign",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: true,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.2,
      maxConfidence: 0.5
    }
  },
  {
    category: "Campaign Creation",
    description: "Partial campaign details",
    input: "create campaign named 'Summer Sale'",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: true,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.2,
      maxConfidence: 0.5
    }
  },
  {
    category: "Campaign Creation",
    description: "Almost complete campaign",
    input: "create campaign named 'Summer Sale' for 'VIP customers' using 'Welcome Template'",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: true,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.2,
      maxConfidence: 0.5
    }
  },
  {
    category: "Campaign Creation",
    description: "Complete campaign with all details",
    input: "create campaign named 'Summer Sale' for 'VIP customers' using 'Welcome Template' scheduled for 'tomorrow'",
    expectedBehavior: {
      shouldExecuteTools: true,
      shouldAskForDetails: false,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0
    }
  },
  {
    category: "Campaign Creation",
    description: "Natural language campaign request",
    input: "I need to create a campaign for construction companies about safety equipment, schedule it for next Monday",
    expectedBehavior: {
      shouldExecuteTools: true,
      shouldAskForDetails: false,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0
    }
  },
  {
    category: "Campaign Creation",
    description: "Help with campaign creation",
    input: "help me create a campaign",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: false,
      shouldProvideHelp: true,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0
    }
  },

  // === DATA INQUIRIES ===
  {
    category: "Data Inquiries",
    description: "Show existing campaigns",
    input: "show me my campaigns",
    expectedBehavior: {
      shouldExecuteTools: true,
      shouldAskForDetails: false,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0
    }
  },
  {
    category: "Data Inquiries",
    description: "List campaigns",
    input: "list campaigns",
    expectedBehavior: {
      shouldExecuteTools: true,
      shouldAskForDetails: false,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0
    }
  },
  {
    category: "Data Inquiries",
    description: "Show templates",
    input: "what templates do I have?",
    expectedBehavior: {
      shouldExecuteTools: true,
      shouldAskForDetails: false,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0
    }
  },
  {
    category: "Data Inquiries",
    description: "Show audience data",
    input: "show me my audience",
    expectedBehavior: {
      shouldExecuteTools: true,
      shouldAskForDetails: false,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0
    }
  },
  {
    category: "Data Inquiries",
    description: "System status check",
    input: "is the system working?",
    expectedBehavior: {
      shouldExecuteTools: true,
      shouldAskForDetails: false,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0
    }
  },

  // === TEMPLATE MANAGEMENT ===
  {
    category: "Template Management",
    description: "Create template request",
    input: "create email template",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: true,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.2,
      maxConfidence: 0.5
    }
  },
  {
    category: "Template Management",
    description: "Create template with details",
    input: "create template named 'Welcome Email' with subject 'Welcome!' and content 'Thanks for joining'",
    expectedBehavior: {
      shouldExecuteTools: true,
      shouldAskForDetails: false,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.8,
      maxConfidence: 1.0
    }
  },

  // === AMBIGUOUS REQUESTS ===
  {
    category: "Ambiguous Requests",
    description: "Very vague request",
    input: "do something",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: true,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: true,
      minConfidence: 0.2,
      maxConfidence: 0.5
    }
  },
  {
    category: "Ambiguous Requests",
    description: "Pronoun reference",
    input: "what is this",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: true,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: true,
      minConfidence: 0.2,
      maxConfidence: 0.5
    }
  },
  {
    category: "Ambiguous Requests",
    description: "Overly broad request",
    input: "show me everything",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: true,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: true,
      minConfidence: 0.2,
      maxConfidence: 0.5
    }
  },

  // === EDGE CASES ===
  {
    category: "Edge Cases",
    description: "Conflicting information",
    input: "create campaign named 'Test' but actually call it 'Real Test'",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: true,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: true,
      minConfidence: 0.2,
      maxConfidence: 0.5
    }
  },
  {
    category: "Edge Cases",
    description: "Multi-step request",
    input: "create a campaign and then show me all campaigns",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: true,
      shouldProvideHelp: false,
      shouldAdmitUncertainty: false,
      minConfidence: 0.2,
      maxConfidence: 0.5
    }
  },
  {
    category: "Edge Cases",
    description: "Question about capabilities",
    input: "can you create campaigns?",
    expectedBehavior: {
      shouldExecuteTools: false,
      shouldAskForDetails: false,
      shouldProvideHelp: true,
      shouldAdmitUncertainty: false,
      minConfidence: 0.7,
      maxConfidence: 1.0
    }
  }
]

async function runUseCaseTest(test: UseCaseTest, agent: RAGDatabaseAgent): Promise<{
  passed: boolean
  issues: string[]
  response: any
}> {
  console.log(`\n🧪 ${test.category}: ${test.description}`)
  console.log(`📝 Input: "${test.input}"`)
  
  const response = await agent.processMessage(test.input)
  const issues: string[] = []
  
  // Check tool execution
  if (test.expectedBehavior.shouldExecuteTools && response.toolCalls.length === 0) {
    issues.push('Should execute tools but does not')
  } else if (!test.expectedBehavior.shouldExecuteTools && response.toolCalls.length > 0) {
    issues.push('Should not execute tools but does')
  }
  
  // Check confidence levels
  if (response.confidence < test.expectedBehavior.minConfidence) {
    issues.push(`Confidence too low: ${response.confidence} < ${test.expectedBehavior.minConfidence}`)
  }
  if (response.confidence > test.expectedBehavior.maxConfidence) {
    issues.push(`Confidence too high: ${response.confidence} > ${test.expectedBehavior.maxConfidence}`)
  }
  
  // Check for help response
  if (test.expectedBehavior.shouldProvideHelp) {
    const hasHelp = response.message.includes('I can help you with') || 
                   response.message.includes('capabilities') ||
                   response.message.includes('What would you like to work on')
    if (!hasHelp) {
      issues.push('Should provide help but does not')
    }
  }
  
  // Check for detail requests
  if (test.expectedBehavior.shouldAskForDetails) {
    const asksForDetails = response.message.includes('need more specific') ||
                          response.message.includes('Please provide') ||
                          response.message.includes('more details')
    if (!asksForDetails) {
      issues.push('Should ask for details but does not')
    }
  }
  
  // Check for uncertainty admission
  if (test.expectedBehavior.shouldAdmitUncertainty) {
    const admitsUncertainty = response.message.includes('not sure') ||
                             response.message.includes('uncertain') ||
                             response.message.includes('⚠️') ||
                             response.message.includes('Confidence:')
    if (!admitsUncertainty) {
      issues.push('Should admit uncertainty but does not')
    }
  }
  
  const passed = issues.length === 0
  
  console.log(`🤖 Response: ${response.message.substring(0, 150)}...`)
  console.log(`📊 Confidence: ${Math.round(response.confidence * 100)}%`)
  console.log(`🔧 Tools: ${response.toolCalls.length}`)
  console.log(`✅ Passed: ${passed}`)
  
  if (issues.length > 0) {
    console.log(`❌ Issues: ${issues.join(', ')}`)
  }
  
  return { passed, issues, response }
}

async function runComprehensiveUseCaseTests() {
  console.log('🎯 COMPREHENSIVE USE CASE TESTING')
  console.log('=====================================')
  
  const agent = new RAGDatabaseAgent()
  let passedTests = 0
  let totalTests = useCaseTests.length
  const categoryResults: { [key: string]: { passed: number, total: number } } = {}
  
  for (const test of useCaseTests) {
    const result = await runUseCaseTest(test, agent)
    
    if (result.passed) {
      passedTests++
    }
    
    // Track by category
    if (!categoryResults[test.category]) {
      categoryResults[test.category] = { passed: 0, total: 0 }
    }
    categoryResults[test.category].total++
    if (result.passed) {
      categoryResults[test.category].passed++
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log(`\n📊 OVERALL RESULTS:`)
  console.log(`✅ Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`)
  
  console.log(`\n📈 RESULTS BY CATEGORY:`)
  Object.entries(categoryResults).forEach(([category, results]) => {
    const percentage = Math.round(results.passed / results.total * 100)
    console.log(`  ${category}: ${results.passed}/${results.total} (${percentage}%)`)
  })
  
  // Show failed tests
  const failedTests = useCaseTests.filter((test, index) => {
    // This is a simplified check - in real implementation we'd track results
    return false // Placeholder
  })
  
  if (failedTests.length > 0) {
    console.log(`\n❌ FAILED TESTS:`)
    failedTests.forEach((test, index) => {
      console.log(`  ${index + 1}. ${test.category}: ${test.description}`)
    })
  }
  
  console.log(`\n🎉 Comprehensive testing complete!`)
  
  return {
    passedTests,
    totalTests,
    passRate: passedTests / totalTests,
    categoryResults
  }
}

runComprehensiveUseCaseTests()


