#!/usr/bin/env python3
"""
AI Safety Guard System
Prevents catastrophic failures by monitoring and blocking dangerous operations
"""

import time
import json
import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import re

# Configuration
NEXTJS_BASE_URL = "http://localhost:3000"

# Safety thresholds
SAFETY_THRESHOLDS = {
    "max_email_volume_per_hour": 1000,
    "max_database_operations_per_minute": 100,
    "max_api_calls_per_minute": 200,
    "max_response_time_seconds": 10,
    "max_memory_usage_percent": 90,
    "max_cpu_usage_percent": 95,
    "max_concurrent_operations": 50
}

# Dangerous command patterns
DANGEROUS_COMMANDS = [
    r"rm\s+-rf",
    r"delete\s+from\s+.*where",
    r"drop\s+table",
    r"truncate\s+table",
    r"format\s+c:",
    r"shutdown",
    r"reboot",
    r"kill\s+-9",
    r"sudo\s+rm",
    r"chmod\s+777"
]

# Sensitive data patterns - Enhanced regex patterns
SENSITIVE_PATTERNS = [
    # Password patterns
    r"password\s*[:=]\s*['\"][^'\"]+['\"]",
    r"pwd\s*[:=]\s*['\"][^'\"]+['\"]",
    r"pass\s*[:=]\s*['\"][^'\"]+['\"]",
    r"the\s+password\s+is\s+['\"][^'\"]+['\"]",
    r"password\s+is\s+['\"][^'\"]+['\"]",
    
    # API Key patterns
    r"api[_-]?key\s*[:=]\s*['\"][^'\"]+['\"]",
    r"apikey\s*[:=]\s*['\"][^'\"]+['\"]",
    r"the\s+api\s+key\s+is\s+['\"][^'\"]+['\"]",
    r"api\s+key\s+is\s+['\"][^'\"]+['\"]",
    r"sk-[a-zA-Z0-9]{20,}",  # OpenAI style keys
    r"pk_[a-zA-Z0-9]{20,}",  # Stripe style keys
    r"[a-zA-Z0-9]{32,}",     # Generic long keys
    
    # Secret patterns
    r"secret\s*[:=]\s*['\"][^'\"]+['\"]",
    r"the\s+secret\s+is\s+['\"][^'\"]+['\"]",
    r"secret\s+is\s+['\"][^'\"]+['\"]",
    
    # Token patterns
    r"token\s*[:=]\s*['\"][^'\"]+['\"]",
    r"the\s+token\s+is\s+['\"][^'\"]+['\"]",
    r"token\s+is\s+['\"][^'\"]+['\"]",
    r"bearer\s+[a-zA-Z0-9._-]+",
    r"jwt\s+[a-zA-Z0-9._-]+",
    
    # Private key patterns
    r"private[_-]?key\s*[:=]\s*['\"][^'\"]+['\"]",
    r"private\s+key\s+is\s+['\"][^'\"]+['\"]",
    r"-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----",
    
    # Database URL patterns
    r"database[_-]?url\s*[:=]\s*['\"][^'\"]+['\"]",
    r"db[_-]?url\s*[:=]\s*['\"][^'\"]+['\"]",
    r"connection[_-]?string\s*[:=]\s*['\"][^'\"]+['\"]",
    r"postgresql://[^'\"]+",
    r"mysql://[^'\"]+",
    r"mongodb://[^'\"]+",
    
    # Other sensitive patterns
    r"access[_-]?key\s*[:=]\s*['\"][^'\"]+['\"]",
    r"secret[_-]?key\s*[:=]\s*['\"][^'\"]+['\"]",
    r"auth[_-]?token\s*[:=]\s*['\"][^'\"]+['\"]",
    r"session[_-]?id\s*[:=]\s*['\"][^'\"]+['\"]",
    r"cookie\s*[:=]\s*['\"][^'\"]+['\"]"
]

class AISafetyGuard:
    def __init__(self):
        self.operation_log = []
        self.blocked_operations = []
        self.safety_violations = []
        self.setup_logging()
        
    def setup_logging(self):
        """Setup logging for safety monitoring"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('ai-safety-guard.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def check_dangerous_commands(self, query: str, response: str) -> List[str]:
        """Check for dangerous commands in AI response"""
        violations = []
        
        # Check for dangerous command patterns
        for pattern in DANGEROUS_COMMANDS:
            if re.search(pattern, response, re.IGNORECASE):
                violations.append(f"Dangerous command detected: {pattern}")
        
        # Check for system-level operations
        dangerous_keywords = [
            "sudo", "root", "admin", "system", "kernel", "registry",
            "format", "partition", "boot", "bios", "firmware"
        ]
        
        for keyword in dangerous_keywords:
            if re.search(rf"\b{keyword}\b", response, re.IGNORECASE):
                violations.append(f"System-level operation detected: {keyword}")
        
        return violations
    
    def check_sensitive_data_exposure(self, response: str) -> List[str]:
        """Check for sensitive data exposure in AI response"""
        violations = []
        
        for pattern in SENSITIVE_PATTERNS:
            if re.search(pattern, response, re.IGNORECASE):
                violations.append(f"Sensitive data exposure detected: {pattern}")
        
        return violations
    
    def check_email_safety(self, email_data: Dict[str, Any]) -> List[str]:
        """Check email sending safety"""
        violations = []
        
        # Check email volume
        if email_data.get("recipient_count", 0) > SAFETY_THRESHOLDS["max_email_volume_per_hour"]:
            violations.append(f"Email volume too high: {email_data['recipient_count']} recipients")
        
        # Check for spam-like content
        content = email_data.get("content", "").lower()
        spam_indicators = [
            "click here", "act now", "limited time", "free money",
            "congratulations", "you've won", "urgent", "immediate action"
        ]
        
        spam_count = sum(1 for indicator in spam_indicators if indicator in content)
        if spam_count >= 3:
            violations.append("Potential spam content detected")
        
        # Check for suspicious links
        if re.search(r"http[s]?://[^\s]+", content):
            violations.append("External links detected - requires approval")
        
        return violations
    
    def check_database_safety(self, db_operation: Dict[str, Any]) -> List[str]:
        """Check database operation safety"""
        violations = []
        
        operation_type = db_operation.get("operation", "").lower()
        query = db_operation.get("query", "").lower()
        table_name = db_operation.get("table", "").lower()
        
        # Check for destructive operations
        destructive_ops = ["delete", "drop", "truncate", "alter"]
        if any(op in operation_type for op in destructive_ops):
            violations.append(f"Destructive database operation: {operation_type}")
        
        # Enhanced WHERE clause checking
        if operation_type == "delete":
            if "where" not in query:
                violations.append("DELETE operation without WHERE clause - could affect all records")
            elif "where 1=1" in query or "where true" in query:
                violations.append("DELETE operation with always-true WHERE clause - affects all records")
            elif "limit" not in query and "top" not in query:
                # Check if it's a safe DELETE with specific conditions
                safe_patterns = ["where id =", "where email =", "where name =", "where status ="]
                if not any(pattern in query for pattern in safe_patterns):
                    violations.append("DELETE operation without specific WHERE conditions")
        
        # Check for operations on critical tables
        critical_tables = ["users", "campaigns", "audience_groups", "templates", "schedules", "email_jobs"]
        if table_name in critical_tables and operation_type in destructive_ops:
            violations.append(f"Destructive operation on critical table: {table_name}")
        
        # Check for DROP operations
        if operation_type == "drop":
            violations.append(f"DROP operation detected - will permanently delete table: {table_name}")
        
        # Check for TRUNCATE operations
        if operation_type == "truncate":
            violations.append(f"TRUNCATE operation detected - will delete all data from table: {table_name}")
        
        # Check for ALTER operations on critical tables
        if operation_type == "alter" and table_name in critical_tables:
            violations.append(f"ALTER operation on critical table: {table_name}")
        
        return violations
    
    def check_api_safety(self, api_call: Dict[str, Any]) -> List[str]:
        """Check API call safety"""
        violations = []
        
        # Check for excessive API calls
        if api_call.get("calls_per_minute", 0) > SAFETY_THRESHOLDS["max_api_calls_per_minute"]:
            violations.append(f"Excessive API calls: {api_call['calls_per_minute']}/min")
        
        # Check for dangerous endpoints
        endpoint = api_call.get("endpoint", "")
        dangerous_endpoints = [
            "/api/admin/delete", "/api/admin/destroy", "/api/admin/reset",
            "/api/admin/format", "/api/admin/shutdown"
        ]
        
        if any(dangerous in endpoint for dangerous in dangerous_endpoints):
            violations.append(f"Dangerous API endpoint: {endpoint}")
        
        # Check for missing authentication
        if not api_call.get("authenticated", False) and "/api/admin/" in endpoint:
            violations.append(f"Admin endpoint without authentication: {endpoint}")
        
        return violations
    
    def check_resource_safety(self) -> List[str]:
        """Check system resource safety"""
        violations = []
        
        try:
            import psutil
            
            # Check CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            if cpu_percent > SAFETY_THRESHOLDS["max_cpu_usage_percent"]:
                violations.append(f"High CPU usage: {cpu_percent}%")
            
            # Check memory usage
            memory = psutil.virtual_memory()
            if memory.percent > SAFETY_THRESHOLDS["max_memory_usage_percent"]:
                violations.append(f"High memory usage: {memory.percent}%")
            
            # Check disk usage
            disk = psutil.disk_usage('/')
            if disk.percent > 95:
                violations.append(f"Critical disk usage: {disk.percent}%")
            
        except ImportError:
            violations.append("Cannot monitor system resources - psutil not available")
        except Exception as e:
            violations.append(f"Resource monitoring error: {e}")
        
        return violations
    
    def check_operation_frequency(self, operation_type: str) -> List[str]:
        """Check operation frequency for rate limiting"""
        violations = []
        
        now = datetime.now()
        recent_operations = [
            op for op in self.operation_log
            if now - op["timestamp"] < timedelta(minutes=1)
        ]
        
        # Count operations by type
        operation_counts = {}
        for op in recent_operations:
            op_type = op.get("type", "unknown")
            operation_counts[op_type] = operation_counts.get(op_type, 0) + 1
        
        # Check thresholds
        if operation_type == "email" and operation_counts.get("email", 0) > SAFETY_THRESHOLDS["max_email_volume_per_hour"]:
            violations.append(f"Email rate limit exceeded: {operation_counts['email']}/min")
        
        if operation_type == "database" and operation_counts.get("database", 0) > SAFETY_THRESHOLDS["max_database_operations_per_minute"]:
            violations.append(f"Database rate limit exceeded: {operation_counts['database']}/min")
        
        if operation_type == "api" and operation_counts.get("api", 0) > SAFETY_THRESHOLDS["max_api_calls_per_minute"]:
            violations.append(f"API rate limit exceeded: {operation_counts['api']}/min")
        
        return violations
    
    def validate_ai_response(self, query: str, response: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Validate AI response for safety"""
        violations = []
        blocked = False
        
        # Check for dangerous commands
        command_violations = self.check_dangerous_commands(query, response)
        violations.extend(command_violations)
        
        # Check for sensitive data exposure
        sensitive_violations = self.check_sensitive_data_exposure(response)
        violations.extend(sensitive_violations)
        
        # Check resource safety
        resource_violations = self.check_resource_safety()
        violations.extend(resource_violations)
        
        # Check operation frequency
        if context.get("operation_type"):
            freq_violations = self.check_operation_frequency(context["operation_type"])
            violations.extend(freq_violations)
        
        # Determine if response should be blocked
        if violations:
            blocked = True
            self.blocked_operations.append({
                "timestamp": datetime.now(),
                "query": query,
                "response": response,
                "violations": violations,
                "context": context
            })
            
            self.logger.warning(f"AI response blocked due to safety violations: {violations}")
        
        # Log operation
        self.operation_log.append({
            "timestamp": datetime.now(),
            "type": context.get("operation_type", "unknown"),
            "query": query,
            "blocked": blocked,
            "violations": violations
        })
        
        # Keep only last 1000 operations
        if len(self.operation_log) > 1000:
            self.operation_log = self.operation_log[-1000:]
        
        return {
            "safe": not blocked,
            "blocked": blocked,
            "violations": violations,
            "recommendations": self.generate_safety_recommendations(violations)
        }
    
    def generate_safety_recommendations(self, violations: List[str]) -> List[str]:
        """Generate safety recommendations based on violations"""
        recommendations = []
        
        for violation in violations:
            if "Dangerous command" in violation:
                recommendations.append("Remove dangerous system commands from response")
            elif "Sensitive data" in violation:
                recommendations.append("Sanitize response to remove sensitive information")
            elif "High CPU usage" in violation:
                recommendations.append("Reduce system load or scale resources")
            elif "High memory usage" in violation:
                recommendations.append("Optimize memory usage or increase available memory")
            elif "rate limit exceeded" in violation:
                recommendations.append("Implement rate limiting or reduce operation frequency")
            elif "spam content" in violation:
                recommendations.append("Review email content for spam indicators")
            elif "External links" in violation:
                recommendations.append("Approve external links before including in emails")
        
        return recommendations
    
    def get_safety_report(self) -> Dict[str, Any]:
        """Generate comprehensive safety report"""
        now = datetime.now()
        
        # Count recent operations
        recent_ops = [
            op for op in self.operation_log
            if now - op["timestamp"] < timedelta(hours=1)
        ]
        
        blocked_ops = [op for op in recent_ops if op["blocked"]]
        
        # Count violations by type
        violation_counts = {}
        for op in recent_ops:
            for violation in op["violations"]:
                violation_type = violation.split(":")[0] if ":" in violation else violation
                violation_counts[violation_type] = violation_counts.get(violation_type, 0) + 1
        
        return {
            "timestamp": now.isoformat(),
            "total_operations": len(recent_ops),
            "blocked_operations": len(blocked_ops),
            "block_rate": len(blocked_ops) / max(1, len(recent_ops)),
            "violation_counts": violation_counts,
            "recent_violations": [op["violations"] for op in blocked_ops[-10:]],
            "safety_score": self.calculate_safety_score(blocked_ops, recent_ops)
        }
    
    def calculate_safety_score(self, blocked_ops: List[Dict], total_ops: List[Dict]) -> int:
        """Calculate overall safety score (0-100)"""
        if not total_ops:
            return 100
        
        block_rate = len(blocked_ops) / len(total_ops)
        
        # Safety score decreases with block rate
        if block_rate == 0:
            return 100
        elif block_rate < 0.01:  # Less than 1% blocked
            return 90
        elif block_rate < 0.05:  # Less than 5% blocked
            return 80
        elif block_rate < 0.10:  # Less than 10% blocked
            return 70
        elif block_rate < 0.20:  # Less than 20% blocked
            return 60
        else:
            return 50
    
    def start_safety_monitoring(self):
        """Start continuous safety monitoring"""
        self.logger.info("Starting AI safety monitoring...")
        
        try:
            while True:
                # Check current safety status
                safety_report = self.get_safety_report()
                
                # Print safety status
                safety_score = safety_report["safety_score"]
                if safety_score >= 90:
                    status_emoji = "🟢"
                    status_text = "EXCELLENT"
                elif safety_score >= 80:
                    status_emoji = "🟡"
                    status_text = "GOOD"
                elif safety_score >= 70:
                    status_emoji = "🟠"
                    status_text = "FAIR"
                else:
                    status_emoji = "🔴"
                    status_text = "POOR"
                
                print(f"{status_emoji} AI Safety Status: {status_text} ({safety_score}/100)")
                print(f"   Operations: {safety_report['total_operations']}")
                print(f"   Blocked: {safety_report['blocked_operations']}")
                print(f"   Block Rate: {safety_report['block_rate']:.2%}")
                
                if safety_report["violation_counts"]:
                    print(f"   Top Violations:")
                    for violation, count in sorted(safety_report["violation_counts"].items(), key=lambda x: x[1], reverse=True)[:3]:
                        print(f"     - {violation}: {count}")
                
                print("-" * 60)
                
                time.sleep(30)  # Check every 30 seconds
                
        except KeyboardInterrupt:
            self.logger.info("Safety monitoring stopped by user")
        except Exception as e:
            self.logger.error(f"Safety monitoring error: {e}")

def main():
    """Main function"""
    guard = AISafetyGuard()
    
    # Test safety validation
    print("🛡️ Testing AI Safety Guard...")
    
    # Test dangerous command detection
    test_query = "How do I delete all data?"
    test_response = "You can use 'rm -rf /' to delete everything"
    
    result = guard.validate_ai_response(test_query, test_response, {"operation_type": "system"})
    
    print(f"Query: {test_query}")
    print(f"Response: {test_response}")
    print(f"Safe: {result['safe']}")
    print(f"Blocked: {result['blocked']}")
    print(f"Violations: {result['violations']}")
    print(f"Recommendations: {result['recommendations']}")
    
    # Generate safety report
    print("\n📊 Safety Report:")
    safety_report = guard.get_safety_report()
    print(json.dumps(safety_report, indent=2))
    
    # Ask if user wants to start continuous monitoring
    try:
        response = input("\nStart continuous safety monitoring? (y/n): ").lower().strip()
        if response == 'y':
            guard.start_safety_monitoring()
    except KeyboardInterrupt:
        print("\nExiting...")

if __name__ == "__main__":
    main()
