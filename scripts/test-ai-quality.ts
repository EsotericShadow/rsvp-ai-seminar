#!/usr/bin/env tsx

import { RAGDatabaseAgent } from '../src/lib/agents/RAGDatabaseAgent'

interface QualityTest {
  input: string
  expectedBehaviors: {
    shouldAdmitUncertainty?: boolean
    shouldAskForClarification?: boolean
    shouldExecuteTools?: boolean
    minConfidence?: number
    maxConfidence?: number
  }
  description: string
}

const qualityTests: QualityTest[] = [
  {
    input: "help",
    expectedBehaviors: {
      shouldAdmitUncertainty: true,
      shouldAskForClarification: true,
      shouldExecuteTools: false,
      maxConfidence: 0.6
    },
    description: "Vague single-word request should admit uncertainty"
  },
  {
    input: "create campaign",
    expectedBehaviors: {
      shouldAdmitUncertainty: true,
      shouldAskForClarification: true,
      shouldExecuteTools: false,
      maxConfidence: 0.7
    },
    description: "Ambiguous request should ask for clarification"
  },
  {
    input: "create campaign named 'Test Campaign' for 'VIP customers' using 'Welcome Template' scheduled for 'tomorrow'",
    expectedBehaviors: {
      shouldAdmitUncertainty: false,
      shouldAskForClarification: false,
      shouldExecuteTools: true,
      minConfidence: 0.8
    },
    description: "Detailed request should execute tools with high confidence"
  },
  {
    input: "what is this",
    expectedBehaviors: {
      shouldAdmitUncertainty: true,
      shouldAskForClarification: true,
      shouldExecuteTools: false,
      maxConfidence: 0.5
    },
    description: "Vague pronoun reference should admit uncertainty"
  },
  {
    input: "show me everything",
    expectedBehaviors: {
      shouldAdmitUncertainty: true,
      shouldAskForClarification: true,
      shouldExecuteTools: false,
      maxConfidence: 0.6
    },
    description: "Overly broad request should ask for specificity"
  },
  {
    input: "create a campaign for the construction industry with a subject line about safety equipment and schedule it for next Monday at 9 AM",
    expectedBehaviors: {
      shouldAdmitUncertainty: false,
      shouldAskForClarification: false,
      shouldExecuteTools: true,
      minConfidence: 0.8
    },
    description: "Specific detailed request should execute with high confidence"
  },
  {
    input: "do something",
    expectedBehaviors: {
      shouldAdmitUncertainty: true,
      shouldAskForClarification: true,
      shouldExecuteTools: false,
      maxConfidence: 0.4
    },
    description: "Extremely vague request should admit high uncertainty"
  },
  {
    input: "show me the system status",
    expectedBehaviors: {
      shouldAdmitUncertainty: false,
      shouldAskForClarification: false,
      shouldExecuteTools: true,
      minConfidence: 0.8
    },
    description: "Clear system query should execute with confidence"
  }
]

async function runQualityTest(test: QualityTest, agent: RAGDatabaseAgent): Promise<{
  passed: boolean
  issues: string[]
  response: any
}> {
  console.log(`\n🧪 Testing: "${test.input}"`)
  console.log(`📝 Expected: ${test.description}`)
  
  const response = await agent.processMessage(test.input)
  const issues: string[] = []
  
  // Check confidence levels
  if (test.expectedBehaviors.minConfidence && response.confidence < test.expectedBehaviors.minConfidence) {
    issues.push(`Confidence too low: ${response.confidence} < ${test.expectedBehaviors.minConfidence}`)
  }
  
  if (test.expectedBehaviors.maxConfidence && response.confidence > test.expectedBehaviors.maxConfidence) {
    issues.push(`Confidence too high: ${response.confidence} > ${test.expectedBehaviors.maxConfidence}`)
  }
  
  // Check uncertainty admission
  if (test.expectedBehaviors.shouldAdmitUncertainty) {
    const uncertaintyIndicators = [
      'not sure', 'uncertain', 'not entirely certain', 'confidence:', '⚠️', '🤔', '❓'
    ]
    const hasUncertainty = uncertaintyIndicators.some(indicator => 
      response.message.toLowerCase().includes(indicator)
    )
    if (!hasUncertainty) {
      issues.push('Should admit uncertainty but does not')
    }
  }
  
  // Check clarification requests
  if (test.expectedBehaviors.shouldAskForClarification) {
    const clarificationIndicators = [
      'more specific', 'more details', 'clarify', 'rephrase', 'could you', 'please provide'
    ]
    const asksForClarification = clarificationIndicators.some(indicator => 
      response.message.toLowerCase().includes(indicator)
    )
    if (!asksForClarification) {
      issues.push('Should ask for clarification but does not')
    }
  }
  
  // Check tool execution
  if (test.expectedBehaviors.shouldExecuteTools) {
    if (response.toolCalls.length === 0) {
      issues.push('Should execute tools but does not')
    }
  } else {
    if (response.toolCalls.length > 0) {
      issues.push('Should not execute tools but does')
    }
  }
  
  const passed = issues.length === 0
  
  console.log(`🤖 Response: ${response.message}`)
  console.log(`📊 Confidence: ${Math.round(response.confidence * 100)}%`)
  console.log(`🔧 Tools executed: ${response.toolCalls.length}`)
  console.log(`✅ Passed: ${passed}`)
  
  if (issues.length > 0) {
    console.log(`❌ Issues: ${issues.join(', ')}`)
  }
  
  return { passed, issues, response }
}

async function testAIQuality() {
  console.log('🎯 Testing AI Quality and Uncertainty Handling...')
  
  const agent = new RAGDatabaseAgent()
  let passedTests = 0
  let totalTests = qualityTests.length
  const detailedResults: any[] = []
  
  for (const test of qualityTests) {
    const result = await runQualityTest(test, agent)
    detailedResults.push({ test, result })
    
    if (result.passed) {
      passedTests++
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log(`\n📊 Quality Test Results:`)
  console.log(`✅ Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`)
  
  // Analyze patterns
  const uncertaintyTests = detailedResults.filter(r => r.test.expectedBehaviors.shouldAdmitUncertainty)
  const uncertaintyPassed = uncertaintyTests.filter(r => r.result.passed).length
  console.log(`🎯 Uncertainty handling: ${uncertaintyPassed}/${uncertaintyTests.length} passed`)
  
  const clarificationTests = detailedResults.filter(r => r.test.expectedBehaviors.shouldAskForClarification)
  const clarificationPassed = clarificationTests.filter(r => r.result.passed).length
  console.log(`❓ Clarification requests: ${clarificationPassed}/${clarificationTests.length} passed`)
  
  const toolExecutionTests = detailedResults.filter(r => r.test.expectedBehaviors.shouldExecuteTools)
  const toolExecutionPassed = toolExecutionTests.filter(r => r.result.passed).length
  console.log(`🔧 Tool execution: ${toolExecutionPassed}/${toolExecutionTests.length} passed`)
  
  // Show failed tests
  const failedTests = detailedResults.filter(r => !r.result.passed)
  if (failedTests.length > 0) {
    console.log(`\n❌ Failed Tests:`)
    failedTests.forEach(({ test, result }) => {
      console.log(`  - "${test.input}": ${result.issues.join(', ')}`)
    })
  }
  
  console.log(`\n🎉 Quality testing complete!`)
  
  return {
    passedTests,
    totalTests,
    passRate: passedTests / totalTests,
    detailedResults
  }
}

testAIQuality()


