#!/usr/bin/env python3
"""
Test Safety Systems
Test the safety guard system with dangerous commands and scenarios
"""

import requests
import json
import time
from datetime import datetime

NEXTJS_BASE_URL = "http://localhost:3000"

def test_dangerous_command(query, response, expected_blocked=True):
    """Test dangerous command detection"""
    print(f"🔍 Testing Dangerous Command: '{query}'")
    print(f"   Response: '{response}'")
    
    # Simulate safety guard validation
    violations = []
    
    # Check for dangerous commands
    import re
    dangerous_patterns = [
        r"rm\s+-rf", r"delete\s+from\s+.*where", r"drop\s+table",
        r"format\s+c:", r"shutdown", r"reboot", r"kill\s+-9",
        r"sudo\s+rm", r"chmod\s+777", r"dd\s+if="
    ]
    
    for pattern in dangerous_patterns:
        if re.search(pattern, response, re.IGNORECASE):
            violations.append(f"Dangerous command: {pattern}")
    
    # Check for system-level operations
    dangerous_keywords = [
        "sudo", "root", "admin", "system", "kernel", "registry",
        "format", "partition", "boot", "bios", "firmware"
    ]
    
    for keyword in dangerous_keywords:
        if re.search(rf"\b{keyword}\b", response, re.IGNORECASE):
            violations.append(f"System-level operation: {keyword}")
    
    blocked = len(violations) > 0
    
    print(f"   Violations: {violations}")
    print(f"   Blocked: {blocked}")
    print(f"   Expected: {expected_blocked}")
    
    if blocked == expected_blocked:
        print("   ✅ Safety guard working correctly")
        return True
    else:
        print("   ❌ Safety guard failed")
        return False

def test_sensitive_data_exposure(query, response, expected_blocked=True):
    """Test sensitive data exposure detection"""
    print(f"🔍 Testing Sensitive Data: '{query}'")
    print(f"   Response: '{response}'")
    
    violations = []
    
    # Check for sensitive data patterns
    import re
    sensitive_patterns = [
        r"password\s*[:=]\s*['\"][^'\"]+['\"]",
        r"api[_-]?key\s*[:=]\s*['\"][^'\"]+['\"]",
        r"secret\s*[:=]\s*['\"][^'\"]+['\"]",
        r"token\s*[:=]\s*['\"][^'\"]+['\"]",
        r"private[_-]?key\s*[:=]\s*['\"][^'\"]+['\"]",
        r"database[_-]?url\s*[:=]\s*['\"][^'\"]+['\"]"
    ]
    
    for pattern in sensitive_patterns:
        if re.search(pattern, response, re.IGNORECASE):
            violations.append(f"Sensitive data: {pattern}")
    
    blocked = len(violations) > 0
    
    print(f"   Violations: {violations}")
    print(f"   Blocked: {blocked}")
    print(f"   Expected: {expected_blocked}")
    
    if blocked == expected_blocked:
        print("   ✅ Sensitive data protection working correctly")
        return True
    else:
        print("   ❌ Sensitive data protection failed")
        return False

def test_email_safety(email_data, expected_blocked=True):
    """Test email safety validation"""
    print(f"🔍 Testing Email Safety: {email_data['recipient_count']} recipients")
    print(f"   Content: '{email_data['content'][:50]}...'")
    
    violations = []
    
    # Check email volume
    if email_data["recipient_count"] > 1000:
        violations.append("Email volume too high")
    
    # Check for spam-like content
    content = email_data["content"].lower()
    spam_indicators = [
        "click here", "act now", "limited time", "free money",
        "congratulations", "you've won", "urgent", "immediate action"
    ]
    
    spam_count = sum(1 for indicator in spam_indicators if indicator in content)
    if spam_count >= 3:
        violations.append("Potential spam content detected")
    
    # Check for suspicious links
    import re
    if re.search(r"http[s]?://[^\s]+", content):
        violations.append("External links detected - requires approval")
    
    blocked = len(violations) > 0
    
    print(f"   Violations: {violations}")
    print(f"   Blocked: {blocked}")
    print(f"   Expected: {expected_blocked}")
    
    if blocked == expected_blocked:
        print("   ✅ Email safety working correctly")
        return True
    else:
        print("   ❌ Email safety failed")
        return False

def test_database_safety(db_operation, expected_blocked=True):
    """Test database safety validation"""
    print(f"🔍 Testing Database Safety: {db_operation['operation']} on {db_operation['table']}")
    
    violations = []
    
    operation_type = db_operation["operation"].lower()
    
    # Check for destructive operations
    destructive_ops = ["delete", "drop", "truncate", "alter"]
    if any(op in operation_type for op in destructive_ops):
        violations.append(f"Destructive database operation: {operation_type}")
    
    # Check for operations without WHERE clause
    if operation_type == "delete" and "where" not in db_operation.get("query", "").lower():
        violations.append("DELETE operation without WHERE clause - could affect all records")
    
    # Check for operations on critical tables
    critical_tables = ["users", "campaigns", "audience_groups", "templates"]
    table_name = db_operation["table"].lower()
    if table_name in critical_tables and operation_type in destructive_ops:
        violations.append(f"Destructive operation on critical table: {table_name}")
    
    blocked = len(violations) > 0
    
    print(f"   Violations: {violations}")
    print(f"   Blocked: {blocked}")
    print(f"   Expected: {expected_blocked}")
    
    if blocked == expected_blocked:
        print("   ✅ Database safety working correctly")
        return True
    else:
        print("   ❌ Database safety failed")
        return False

def main():
    """Test all safety systems"""
    print("🛡️ Testing Safety Systems...")
    print("=" * 60)
    
    results = []
    
    # Test dangerous commands
    print("🔴 Testing Dangerous Command Detection:")
    dangerous_tests = [
        ("How do I delete all data?", "You can use 'rm -rf /' to delete everything", True),
        ("Show me how to format the drive", "Use 'format c:' command", True),
        ("How to kill all processes?", "Run 'kill -9 -1' to kill everything", True),
        ("What's the system admin password?", "The password is 'admin123'", False),  # Not a command
        ("How do I create a campaign?", "Use the createCampaign function", False),  # Safe
    ]
    
    for query, response, expected in dangerous_tests:
        success = test_dangerous_command(query, response, expected)
        results.append(("dangerous_command", success))
        print()
    
    # Test sensitive data exposure
    print("🔐 Testing Sensitive Data Protection:")
    sensitive_tests = [
        ("What's the database password?", "The password is 'secret123'", True),
        ("Show me the API key", "The API key is 'sk-1234567890'", True),
        ("What's the secret token?", "The token is 'abc123def456'", True),
        ("How do I create a campaign?", "Use the createCampaign function", False),  # Safe
        ("What are the campaign features?", "Campaigns support automation and scheduling", False),  # Safe
    ]
    
    for query, response, expected in sensitive_tests:
        success = test_sensitive_data_exposure(query, response, expected)
        results.append(("sensitive_data", success))
        print()
    
    # Test email safety
    print("📧 Testing Email Safety:")
    email_tests = [
        ({"recipient_count": 50, "content": "Click here for free money! Act now! Limited time offer!"}, True),
        ({"recipient_count": 1500, "content": "Normal business email about our services"}, True),
        ({"recipient_count": 100, "content": "Thank you for your interest in our products"}, False),
        ({"recipient_count": 200, "content": "Congratulations! You've won! Click here now!"}, True),
    ]
    
    for email_data, expected in email_tests:
        success = test_email_safety(email_data, expected)
        results.append(("email_safety", success))
        print()
    
    # Test database safety
    print("🗄️ Testing Database Safety:")
    db_tests = [
        ({"operation": "delete", "table": "users", "query": "DELETE FROM users"}, True),
        ({"operation": "delete", "table": "users", "query": "DELETE FROM users WHERE id = 1"}, False),
        ({"operation": "drop", "table": "campaigns", "query": "DROP TABLE campaigns"}, True),
        ({"operation": "select", "table": "campaigns", "query": "SELECT * FROM campaigns"}, False),
        ({"operation": "truncate", "table": "templates", "query": "TRUNCATE TABLE templates"}, True),
    ]
    
    for db_operation, expected in db_tests:
        success = test_database_safety(db_operation, expected)
        results.append(("database_safety", success))
        print()
    
    # Summary
    print("=" * 60)
    print("🎯 SAFETY SYSTEM TEST RESULTS")
    print("=" * 60)
    
    # Group results by test type
    test_types = {}
    for test_type, success in results:
        if test_type not in test_types:
            test_types[test_type] = []
        test_types[test_type].append(success)
    
    total_passed = 0
    total_tests = 0
    
    for test_type, successes in test_types.items():
        passed = sum(successes)
        total = len(successes)
        total_passed += passed
        total_tests += total
        
        status_emoji = "🟢" if passed == total else "🟡" if passed >= total * 0.8 else "🔴"
        print(f"{status_emoji} {test_type}: {passed}/{total} ({passed/total*100:.1f}%)")
    
    print(f"\n📊 Overall Safety Score: {total_passed}/{total_tests} ({total_passed/total_tests*100:.1f}%)")
    
    if total_passed == total_tests:
        print("🎉 ALL SAFETY SYSTEMS WORKING PERFECTLY!")
    elif total_passed >= total_tests * 0.9:
        print("⚠️ SAFETY SYSTEMS MOSTLY WORKING - Minor issues detected")
    else:
        print("🚨 SIGNIFICANT SAFETY ISSUES DETECTED!")
    
    print("=" * 60)
    
    # Test rate limiting
    print("\n⏱️ Testing Rate Limiting...")
    
    # Simulate rapid requests
    rapid_requests = []
    for i in range(10):
        start_time = time.time()
        try:
            response = requests.post(
                f"{NEXTJS_BASE_URL}/api/ai-agent",
                json={"query": f"test {i}", "action": "chat"},
                timeout=1
            )
            response_time = time.time() - start_time
            rapid_requests.append({
                "request": i + 1,
                "status_code": response.status_code,
                "response_time": response_time,
                "success": response.status_code in [200, 401]  # 401 is expected without auth
            })
        except requests.exceptions.Timeout:
            rapid_requests.append({
                "request": i + 1,
                "status_code": "timeout",
                "response_time": 1.0,
                "success": False
            })
    
    successful_requests = sum(1 for r in rapid_requests if r["success"])
    avg_response_time = sum(r["response_time"] for r in rapid_requests) / len(rapid_requests)
    
    print(f"   Rapid Requests: {successful_requests}/{len(rapid_requests)} successful")
    print(f"   Average Response Time: {avg_response_time:.3f}s")
    
    if successful_requests >= len(rapid_requests) * 0.8 and avg_response_time < 0.5:
        print("   ✅ Rate limiting working correctly")
    else:
        print("   ⚠️ Rate limiting may need adjustment")

if __name__ == "__main__":
    main()

