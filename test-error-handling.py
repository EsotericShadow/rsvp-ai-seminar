#!/usr/bin/env python3
"""
Test Error Handling and Edge Cases
"""

import requests
import json
import time

# Configuration
NEXTJS_BASE_URL = "http://localhost:3000"

def test_error_handling():
    """Test error handling and edge cases"""
    print("🔍 TESTING ERROR HANDLING AND EDGE CASES")
    print("=" * 50)
    
    # Test various error conditions
    test_cases = [
        # Invalid JSON
        {
            "name": "Invalid JSON",
            "method": "POST",
            "url": f"{NEXTJS_BASE_URL}/api/ai-agent",
            "headers": {"Content-Type": "application/json"},
            "data": "invalid json",
            "expected_status": 400
        },
        
        # Missing query
        {
            "name": "Missing query",
            "method": "POST", 
            "url": f"{NEXTJS_BASE_URL}/api/ai-agent",
            "headers": {"Content-Type": "application/json"},
            "data": json.dumps({"action": "chat"}),
            "expected_status": 400
        },
        
        # Empty query
        {
            "name": "Empty query",
            "method": "POST",
            "url": f"{NEXTJS_BASE_URL}/api/ai-agent", 
            "headers": {"Content-Type": "application/json"},
            "data": json.dumps({"query": "", "action": "chat"}),
            "expected_status": 400
        },
        
        # Very long query
        {
            "name": "Very long query",
            "method": "POST",
            "url": f"{NEXTJS_BASE_URL}/api/ai-agent",
            "headers": {"Content-Type": "application/json"},
            "data": json.dumps({"query": "test " * 10000, "action": "chat"}),
            "expected_status": 401  # Should still require auth
        },
        
        # Invalid action
        {
            "name": "Invalid action",
            "method": "POST",
            "url": f"{NEXTJS_BASE_URL}/api/ai-agent",
            "headers": {"Content-Type": "application/json"},
            "data": json.dumps({"query": "test", "action": "invalid_action"}),
            "expected_status": 401  # Should still require auth
        },
        
        # Missing Content-Type
        {
            "name": "Missing Content-Type",
            "method": "POST",
            "url": f"{NEXTJS_BASE_URL}/api/ai-agent",
            "headers": {},
            "data": json.dumps({"query": "test", "action": "chat"}),
            "expected_status": 400
        },
        
        # GET request to POST endpoint
        {
            "name": "GET to POST endpoint",
            "method": "GET",
            "url": f"{NEXTJS_BASE_URL}/api/ai-agent",
            "headers": {},
            "data": None,
            "expected_status": 200  # GET should work for health check
        },
        
        # Invalid endpoint
        {
            "name": "Invalid endpoint",
            "method": "POST",
            "url": f"{NEXTJS_BASE_URL}/api/invalid-endpoint",
            "headers": {"Content-Type": "application/json"},
            "data": json.dumps({"query": "test", "action": "chat"}),
            "expected_status": 404
        },
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}: {test_case['name']}")
        
        try:
            if test_case['method'] == 'GET':
                response = requests.get(
                    test_case['url'],
                    headers=test_case['headers'],
                    timeout=10
                )
            else:
                response = requests.post(
                    test_case['url'],
                    headers=test_case['headers'],
                    data=test_case['data'],
                    timeout=10
                )
            
            actual_status = response.status_code
            expected_status = test_case['expected_status']
            
            if actual_status == expected_status:
                print(f"   ✅ Status {actual_status} (expected {expected_status})")
                results.append({
                    "test": test_case['name'],
                    "status": "pass",
                    "actual_status": actual_status,
                    "expected_status": expected_status
                })
            else:
                print(f"   ❌ Status {actual_status} (expected {expected_status})")
                results.append({
                    "test": test_case['name'],
                    "status": "fail",
                    "actual_status": actual_status,
                    "expected_status": expected_status
                })
            
            # Show response content for debugging
            if actual_status != expected_status:
                try:
                    response_data = response.json()
                    print(f"   📄 Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   📄 Response: {response.text[:200]}...")
                    
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request failed: {e}")
            results.append({
                "test": test_case['name'],
                "status": "error",
                "error": str(e)
            })
        
        time.sleep(0.5)  # Rate limiting
    
    # Analyze results
    print(f"\n📊 ERROR HANDLING ANALYSIS")
    print("=" * 50)
    
    total_tests = len(results)
    passed_tests = len([r for r in results if r['status'] == 'pass'])
    failed_tests = len([r for r in results if r['status'] == 'fail'])
    error_tests = len([r for r in results if r['status'] == 'error'])
    
    print(f"Total tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")
    print(f"Errors: {error_tests}")
    
    # Show failed tests
    failed_examples = [r for r in results if r['status'] == 'fail']
    if failed_examples:
        print(f"\n❌ FAILED TESTS:")
        for example in failed_examples:
            print(f"   {example['test']}: got {example['actual_status']}, expected {example['expected_status']}")
    
    # Show error tests
    error_examples = [r for r in results if r['status'] == 'error']
    if error_examples:
        print(f"\n💥 ERROR TESTS:")
        for example in error_examples:
            print(f"   {example['test']}: {example['error']}")
    
    return results

def test_performance():
    """Test system performance"""
    print(f"\n🚀 TESTING SYSTEM PERFORMANCE")
    print("=" * 50)
    
    # Test health check performance
    health_check_times = []
    
    for i in range(5):
        start_time = time.time()
        try:
            response = requests.get(f"{NEXTJS_BASE_URL}/api/ai-agent", timeout=10)
            end_time = time.time()
            
            response_time = end_time - start_time
            health_check_times.append(response_time)
            
            print(f"   Health check {i+1}: {response_time:.3f}s (status: {response.status_code})")
            
        except requests.exceptions.RequestException as e:
            print(f"   Health check {i+1}: Failed - {e}")
        
        time.sleep(0.5)
    
    if health_check_times:
        avg_time = sum(health_check_times) / len(health_check_times)
        min_time = min(health_check_times)
        max_time = max(health_check_times)
        
        print(f"\n📊 PERFORMANCE SUMMARY:")
        print(f"   Average response time: {avg_time:.3f}s")
        print(f"   Minimum response time: {min_time:.3f}s")
        print(f"   Maximum response time: {max_time:.3f}s")
        
        if avg_time < 1.0:
            print(f"   ✅ Performance: Excellent (< 1s)")
        elif avg_time < 2.0:
            print(f"   ✅ Performance: Good (< 2s)")
        elif avg_time < 5.0:
            print(f"   ⚠️ Performance: Acceptable (< 5s)")
        else:
            print(f"   ❌ Performance: Poor (> 5s)")
    
    return health_check_times

def main():
    """Main function"""
    error_results = test_error_handling()
    performance_results = test_performance()
    
    print(f"\n🎯 OVERALL ASSESSMENT")
    print("=" * 50)
    
    total_tests = len(error_results)
    passed_tests = len([r for r in error_results if r['status'] == 'pass'])
    
    if passed_tests == total_tests:
        print("✅ All error handling tests passed!")
    else:
        print(f"⚠️ {passed_tests}/{total_tests} error handling tests passed")
    
    if performance_results:
        avg_time = sum(performance_results) / len(performance_results)
        if avg_time < 2.0:
            print("✅ Performance is good!")
        else:
            print("⚠️ Performance could be improved")

if __name__ == "__main__":
    main()
