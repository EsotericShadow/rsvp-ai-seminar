#!/usr/bin/env python3
"""
Test Fallback Knowledge System
"""

import requests
import json
import time

# Configuration
NEXTJS_BASE_URL = "http://localhost:3000"

def test_fallback_system():
    """Test the fallback knowledge system when RAG fails"""
    print("🔍 TESTING FALLBACK KNOWLEDGE SYSTEM")
    print("=" * 50)
    
    # Test queries that should trigger fallback responses
    test_queries = [
        "What is the RSVP system?",
        "How does email sending work?",
        "What are the main features?",
        "How do I create a campaign?",
        "What is campaign management?",
        "How does audience segmentation work?",
        "What are email templates?",
        "How does analytics work?",
        "What is the admin system?",
        "How does authentication work?",
    ]
    
    results = []
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n📝 Test {i}: '{query}'")
        
        try:
            # Test the AI Agent API
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
                    "fallback_used": False
                })
            elif response.status_code == 200:
                data = response.json()
                
                # Check if fallback was used
                fallback_used = data.get('fallback', False)
                answer = data.get('answer', '')
                confidence = data.get('confidence', 0)
                
                print(f"   ✅ Response received")
                print(f"   🔄 Fallback used: {fallback_used}")
                print(f"   📊 Confidence: {confidence}")
                print(f"   📝 Answer length: {len(answer)} characters")
                
                if fallback_used:
                    print(f"   💭 Fallback answer preview: {answer[:100]}...")
                
                results.append({
                    "query": query,
                    "status": "success",
                    "fallback_used": fallback_used,
                    "answer": answer,
                    "confidence": confidence
                })
            else:
                print(f"   ❌ Unexpected status: {response.status_code}")
                results.append({
                    "query": query,
                    "status": f"error_{response.status_code}",
                    "fallback_used": False
                })
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request failed: {e}")
            results.append({
                "query": query,
                "status": "request_failed",
                "fallback_used": False
            })
        
        time.sleep(0.5)  # Rate limiting
    
    # Analyze results
    print(f"\n📊 FALLBACK SYSTEM ANALYSIS")
    print("=" * 50)
    
    total_tests = len(results)
    successful_tests = len([r for r in results if r['status'] == 'success'])
    fallback_used_count = len([r for r in results if r.get('fallback_used', False)])
    avg_confidence = sum([r.get('confidence', 0) for r in results if r.get('confidence', 0) > 0]) / max(1, len([r for r in results if r.get('confidence', 0) > 0]))
    
    print(f"Total tests: {total_tests}")
    print(f"Successful responses: {successful_tests}")
    print(f"Fallback used: {fallback_used_count}")
    print(f"Average confidence: {avg_confidence:.2f}")
    
    # Show fallback examples
    fallback_examples = [r for r in results if r.get('fallback_used', False)]
    if fallback_examples:
        print(f"\n🔄 FALLBACK EXAMPLES:")
        for example in fallback_examples[:3]:
            print(f"   Query: '{example['query']}'")
            print(f"   Answer: '{example['answer'][:150]}...'")
            print(f"   Confidence: {example['confidence']}")
            print()
    
    # Show high-confidence examples
    high_confidence = [r for r in results if r.get('confidence', 0) > 0.8]
    if high_confidence:
        print(f"\n✅ HIGH CONFIDENCE RESPONSES:")
        for example in high_confidence[:3]:
            print(f"   Query: '{example['query']}'")
            print(f"   Confidence: {example['confidence']}")
            print(f"   Fallback: {example.get('fallback_used', False)}")
            print()
    
    return results

def main():
    """Main function"""
    test_fallback_system()

if __name__ == "__main__":
    main()
