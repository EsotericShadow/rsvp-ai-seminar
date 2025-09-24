#!/usr/bin/env python3
"""
Test Query Enhancement System
"""

import requests
import json
import time

# Configuration
NEXTJS_BASE_URL = "http://localhost:3000"

def test_query_enhancement():
    """Test the query enhancement system with various input types"""
    print("🔍 TESTING QUERY ENHANCEMENT SYSTEM")
    print("=" * 50)
    
    test_queries = [
        # Generic queries that should be enhanced
        "create campaign",
        "send email", 
        "view analytics",
        "manage audience",
        "delete campaign",
        "update template",
        "schedule emails",
        
        # Specific queries that shouldn't be enhanced
        "How do I create a new email campaign using the POST /api/admin/campaign/campaigns endpoint?",
        "Show me the exact steps to send a campaign email using the sendCampaignEmail function",
        "What are the required fields for creating a campaign schedule?",
        
        # Edge cases
        "",
        "test",
        "help",
        "what can you do?",
        "show me everything",
        
        # Complex queries
        "I want to create a multi-step email campaign with different templates for different audience segments and schedule them to send at optimal times",
        "How do I set up automated email sequences that trigger based on user behavior and include A/B testing?",
    ]
    
    results = []
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n📝 Test {i}: '{query}'")
        
        try:
            # Test the AI Agent API with query enhancement
            response = requests.post(
                f"{NEXTJS_BASE_URL}/api/ai-agent",
                json={
                    "query": query,
                    "action": "chat"
                },
                headers={
                    "Content-Type": "application/json",
                    "Cookie": "admin-session=test-session"  # Mock session for testing
                },
                timeout=10
            )
            
            if response.status_code == 401:
                print("   ✅ Authentication required (expected)")
                results.append({
                    "query": query,
                    "status": "auth_required",
                    "enhanced": False
                })
            elif response.status_code == 200:
                data = response.json()
                metadata = data.get('metadata', {})
                
                enhancement_applied = metadata.get('enhancementApplied', False)
                enhanced_query = metadata.get('enhancedQuery', query)
                reasoning = metadata.get('enhancementReasoning', '')
                
                print(f"   ✅ Response received")
                print(f"   📊 Enhancement applied: {enhancement_applied}")
                if enhancement_applied:
                    print(f"   🔄 Enhanced query: {enhanced_query[:100]}...")
                    print(f"   💭 Reasoning: {reasoning}")
                
                # Check validation
                validation = metadata.get('validation', {})
                is_valid = validation.get('isValid', False)
                confidence = validation.get('confidence', 0)
                
                print(f"   🛡️ Validation: {'✅ Valid' if is_valid else '❌ Invalid'} (confidence: {confidence:.2f})")
                
                results.append({
                    "query": query,
                    "status": "success",
                    "enhanced": enhancement_applied,
                    "enhanced_query": enhanced_query,
                    "reasoning": reasoning,
                    "validation": {
                        "is_valid": is_valid,
                        "confidence": confidence
                    }
                })
            else:
                print(f"   ❌ Unexpected status: {response.status_code}")
                results.append({
                    "query": query,
                    "status": f"error_{response.status_code}",
                    "enhanced": False
                })
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request failed: {e}")
            results.append({
                "query": query,
                "status": "request_failed",
                "enhanced": False
            })
        
        time.sleep(0.5)  # Rate limiting
    
    # Analyze results
    print(f"\n📊 QUERY ENHANCEMENT ANALYSIS")
    print("=" * 50)
    
    total_tests = len(results)
    successful_tests = len([r for r in results if r['status'] == 'success'])
    enhanced_queries = len([r for r in results if r.get('enhanced', False)])
    valid_responses = len([r for r in results if r.get('validation', {}).get('is_valid', False)])
    
    print(f"Total tests: {total_tests}")
    print(f"Successful responses: {successful_tests}")
    print(f"Enhanced queries: {enhanced_queries}")
    print(f"Valid responses: {valid_responses}")
    
    # Show enhancement examples
    enhanced_examples = [r for r in results if r.get('enhanced', False)]
    if enhanced_examples:
        print(f"\n🔄 ENHANCEMENT EXAMPLES:")
        for example in enhanced_examples[:3]:
            print(f"   Original: '{example['query']}'")
            print(f"   Enhanced: '{example['enhanced_query'][:100]}...'")
            print(f"   Reasoning: {example['reasoning']}")
            print()
    
    # Show validation issues
    invalid_examples = [r for r in results if r.get('validation', {}).get('is_valid', False) == False and r.get('status') == 'success']
    if invalid_examples:
        print(f"\n❌ VALIDATION ISSUES:")
        for example in invalid_examples[:3]:
            print(f"   Query: '{example['query']}'")
            print(f"   Confidence: {example['validation']['confidence']:.2f}")
            print()
    
    return results

def main():
    """Main function"""
    test_query_enhancement()

if __name__ == "__main__":
    main()