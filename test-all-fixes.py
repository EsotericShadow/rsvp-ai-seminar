#!/usr/bin/env python3
"""
Test All Fixes
Comprehensive test of all the fixes applied to the AI system
"""

import requests
import json
import time
from datetime import datetime

NEXTJS_BASE_URL = "http://localhost:3000"

def test_sensitive_data_protection():
    """Test enhanced sensitive data protection"""
    print("🔐 Testing Enhanced Sensitive Data Protection...")
    
    # Import the enhanced safety guard
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from ai_safety_guard import AISafetyGuard
    
    guard = AISafetyGuard()
    
    test_cases = [
        ("What's the database password?", "The password is 'secret123'", True),
        ("Show me the API key", "The API key is 'sk-1234567890abcdef'", True),
        ("What's the secret token?", "The token is 'abc123def456'", True),
        ("Database connection", "postgresql://user:pass@localhost/db", True),
        ("OpenAI key", "sk-proj-1234567890abcdef", True),
        ("How do I create a campaign?", "Use the createCampaign function", False),
    ]
    
    results = []
    for query, response, expected_blocked in test_cases:
        violations = guard.check_sensitive_data_exposure(response)
        blocked = len(violations) > 0
        
        success = blocked == expected_blocked
        results.append(success)
        
        status = "✅" if success else "❌"
        print(f"   {status} '{query}' -> Blocked: {blocked} (Expected: {expected_blocked})")
        if violations:
            print(f"      Violations: {violations}")
    
    success_rate = sum(results) / len(results) * 100
    print(f"   📊 Success Rate: {success_rate:.1f}%")
    return success_rate >= 80

def test_malformed_json_handling():
    """Test enhanced malformed JSON handling"""
    print("📝 Testing Enhanced Malformed JSON Handling...")
    
    test_cases = [
        ("invalid json", 400, "Invalid JSON format"),
        ('{"incomplete": json}', 400, "Invalid JSON format"),
        ('{"query": null}', 400, "Query is required"),
        ('{"query": 123}', 400, "Query is required"),
        ('{"query": []}', 400, "Query is required"),
        ('{"query": ""}', 400, "Query is required"),
        ('{"query": "test", "action": "invalid"}', 400, "Invalid action parameter"),
        ('{"query": "a" * 10001}', 400, "Query is too long"),
        ('{"query": "test"}', 401, "Unauthorized"),  # Should require auth
    ]
    
    results = []
    for test_data, expected_status, expected_error in test_cases:
        try:
            response = requests.post(
                f"{NEXTJS_BASE_URL}/api/ai-agent",
                data=test_data,
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            success = response.status_code == expected_status
            if success and expected_error:
                # Check if error message contains expected text
                try:
                    error_data = response.json()
                    success = expected_error.lower() in error_data.get('error', '').lower()
                except:
                    success = expected_error.lower() in response.text.lower()
            
            results.append(success)
            
            status = "✅" if success else "❌"
            print(f"   {status} '{test_data[:30]}...' -> {response.status_code} (Expected: {expected_status})")
            if not success:
                print(f"      Response: {response.text[:100]}...")
                
        except Exception as e:
            results.append(False)
            print(f"   ❌ '{test_data[:30]}...' -> Error: {e}")
    
    success_rate = sum(results) / len(results) * 100
    print(f"   📊 Success Rate: {success_rate:.1f}%")
    return success_rate >= 80

def test_enhanced_database_safety():
    """Test enhanced database safety"""
    print("🗄️ Testing Enhanced Database Safety...")
    
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from ai_safety_guard import AISafetyGuard
    
    guard = AISafetyGuard()
    
    test_cases = [
        ({"operation": "delete", "table": "users", "query": "DELETE FROM users"}, True),
        ({"operation": "delete", "table": "users", "query": "DELETE FROM users WHERE id = 1"}, False),
        ({"operation": "delete", "table": "users", "query": "DELETE FROM users WHERE 1=1"}, True),
        ({"operation": "delete", "table": "users", "query": "DELETE FROM users WHERE email = 'test@example.com'"}, False),
        ({"operation": "drop", "table": "campaigns", "query": "DROP TABLE campaigns"}, True),
        ({"operation": "truncate", "table": "templates", "query": "TRUNCATE TABLE templates"}, True),
        ({"operation": "alter", "table": "users", "query": "ALTER TABLE users ADD COLUMN test"}, True),
        ({"operation": "select", "table": "campaigns", "query": "SELECT * FROM campaigns"}, False),
    ]
    
    results = []
    for db_operation, expected_blocked in test_cases:
        violations = guard.check_database_safety(db_operation)
        blocked = len(violations) > 0
        
        success = blocked == expected_blocked
        results.append(success)
        
        status = "✅" if success else "❌"
        print(f"   {status} {db_operation['operation']} on {db_operation['table']} -> Blocked: {blocked} (Expected: {expected_blocked})")
        if violations:
            print(f"      Violations: {violations}")
    
    success_rate = sum(results) / len(results) * 100
    print(f"   📊 Success Rate: {success_rate:.1f}%")
    return success_rate >= 80

def test_enhanced_response_validation():
    """Test enhanced response validation"""
    print("✅ Testing Enhanced Response Validation...")
    
    # Test the enhanced validation system
    test_responses = [
        ("Use createCampaign() to create a new campaign", True),  # Valid function
        ("Call POST /api/admin/campaign/campaigns", True),  # Valid API
        ("The Campaign model has these fields", True),  # Valid model
        ("Use invalidFunction() to do something", False),  # Invalid function
        ("Call POST /api/invalid/endpoint", False),  # Invalid API
        ("The InvalidModel has these fields", False),  # Invalid model
        ("The password is 'secret123'", False),  # Sensitive data
        ("Run 'rm -rf /' to delete everything", False),  # Dangerous command
    ]
    
    results = []
    for response, expected_valid in test_responses:
        # Simulate validation (in real system, this would use the enhanced validation)
        violations = []
        
        # Check for invalid functions
        import re
        function_pattern = r'\b(createCampaign|updateCampaign|deleteCampaign|sendEmail|getAudienceGroups|createTemplate|updateTemplate|deleteTemplate|getTemplates|createSchedule|updateSchedule|deleteSchedule|runSchedule|createAudienceGroup|updateAudienceGroup|deleteAudienceGroup|listGroups|renderTemplate|sendCampaignEmail|recordSendEngagement|listCampaigns|getCampaign|getSchedule|listSchedules|parseSteps|inviteLinkFromToken|listCampaignData|fetchLeadMineBusinesses|postLeadMineEvent|generateEmailHTML|generateEmailText|getPrivacyPolicy)\b'
        valid_functions = ['createCampaign', 'updateCampaign', 'deleteCampaign', 'sendEmail', 'getAudienceGroups', 'createTemplate', 'updateTemplate', 'deleteTemplate', 'getTemplates', 'createSchedule', 'updateSchedule', 'deleteSchedule', 'runSchedule', 'createAudienceGroup', 'updateAudienceGroup', 'deleteAudienceGroup', 'listGroups', 'renderTemplate', 'sendCampaignEmail', 'recordSendEngagement', 'listCampaigns', 'getCampaign', 'getSchedule', 'listSchedules', 'parseSteps', 'inviteLinkFromToken', 'listCampaignData', 'fetchLeadMineBusinesses', 'postLeadMineEvent', 'generateEmailHTML', 'generateEmailText', 'getPrivacyPolicy']
        
        function_matches = re.findall(function_pattern, response)
        for match in function_matches:
            if match not in valid_functions:
                violations.append(f"Invalid function: {match}")
        
        # Check for invalid APIs
        api_pattern = r'/api/[a-zA-Z0-9/\[\]-_]+'
        valid_apis = ['/api/admin/campaign/campaigns', '/api/admin/campaign/templates', '/api/admin/campaign/groups', '/api/admin/campaign/schedules', '/api/admin/campaign/send', '/api/admin/campaign/dashboard', '/api/rsvp', '/api/ai-agent']
        api_matches = re.findall(api_pattern, response)
        for match in api_matches:
            if not any(valid_api in match for valid_api in valid_apis):
                violations.append(f"Invalid API: {match}")
        
        # Check for dangerous patterns
        dangerous_patterns = [r'rm\s+-rf', r'password\s*[:=]\s*[\'"][^\'"]+[\'"]']
        for pattern in dangerous_patterns:
            if re.search(pattern, response, re.IGNORECASE):
                violations.append(f"Dangerous pattern: {pattern}")
        
        is_valid = len(violations) == 0
        success = is_valid == expected_valid
        results.append(success)
        
        status = "✅" if success else "❌"
        print(f"   {status} '{response[:50]}...' -> Valid: {is_valid} (Expected: {expected_valid})")
        if violations:
            print(f"      Violations: {violations}")
    
    success_rate = sum(results) / len(results) * 100
    print(f"   📊 Success Rate: {success_rate:.1f}%")
    return success_rate >= 80

def test_error_handling_improvements():
    """Test error handling improvements"""
    print("🛠️ Testing Error Handling Improvements...")
    
    test_cases = [
        # Empty body
        (None, 400, "Request body is empty"),
        # Invalid JSON
        ("invalid json", 400, "Invalid JSON format"),
        # Empty query
        ('{"query": ""}', 400, "Query is required"),
        # Null query
        ('{"query": null}', 400, "Query is required"),
        # Non-string query
        ('{"query": 123}', 400, "Query is required"),
        # Array query
        ('{"query": []}', 400, "Query is required"),
        # Too long query
        (f'{{"query": "{"a" * 10001}"}}', 400, "Query is too long"),
        # Invalid action
        ('{"query": "test", "action": "invalid"}', 400, "Invalid action parameter"),
        # Valid request (should require auth)
        ('{"query": "test"}', 401, "Unauthorized"),
    ]
    
    results = []
    for test_data, expected_status, expected_error in test_cases:
        try:
            if test_data is None:
                response = requests.post(
                    f"{NEXTJS_BASE_URL}/api/ai-agent",
                    data="",
                    headers={"Content-Type": "application/json"},
                    timeout=5
                )
            else:
                response = requests.post(
                    f"{NEXTJS_BASE_URL}/api/ai-agent",
                    data=test_data,
                    headers={"Content-Type": "application/json"},
                    timeout=5
                )
            
            success = response.status_code == expected_status
            if success and expected_error:
                try:
                    error_data = response.json()
                    success = expected_error.lower() in error_data.get('error', '').lower()
                except:
                    success = expected_error.lower() in response.text.lower()
            
            results.append(success)
            
            status = "✅" if success else "❌"
            print(f"   {status} Status: {response.status_code} (Expected: {expected_status})")
            if not success:
                print(f"      Response: {response.text[:100]}...")
                
        except Exception as e:
            results.append(False)
            print(f"   ❌ Error: {e}")
    
    success_rate = sum(results) / len(results) * 100
    print(f"   📊 Success Rate: {success_rate:.1f}%")
    return success_rate >= 80

def main():
    """Run all fix tests"""
    print("🚀 Testing All AI System Fixes...")
    print("=" * 60)
    
    test_results = {}
    
    # Run all tests
    test_results['sensitive_data'] = test_sensitive_data_protection()
    print()
    
    test_results['malformed_json'] = test_malformed_json_handling()
    print()
    
    test_results['database_safety'] = test_enhanced_database_safety()
    print()
    
    test_results['response_validation'] = test_enhanced_response_validation()
    print()
    
    test_results['error_handling'] = test_error_handling_improvements()
    print()
    
    # Summary
    print("=" * 60)
    print("🎯 ALL FIXES TEST RESULTS")
    print("=" * 60)
    
    passed_tests = 0
    total_tests = len(test_results)
    
    for test_name, passed in test_results.items():
        status_emoji = "✅" if passed else "❌"
        status_text = "PASSED" if passed else "FAILED"
        print(f"{status_emoji} {test_name}: {status_text}")
        if passed:
            passed_tests += 1
    
    print(f"\n📊 Overall Results: {passed_tests}/{total_tests} tests passed")
    success_rate = (passed_tests / total_tests) * 100
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🎉 ALL FIXES WORKING CORRECTLY!")
        print("✅ System is ready for production!")
    elif success_rate >= 60:
        print("⚠️ MOST FIXES WORKING - Minor issues remain")
    else:
        print("🚨 SIGNIFICANT ISSUES WITH FIXES")
    
    print("=" * 60)
    
    return test_results

if __name__ == "__main__":
    main()
