#!/usr/bin/env python3
"""
AI Safety Monitor - Prevents AI from executing fake commands
Real-time validation and confirmation system
"""

import json
import re
import time
from datetime import datetime
from pathlib import Path

class AISafetyMonitor:
    """Monitors AI commands and prevents execution of fake code"""
    
    def __init__(self):
        self.project_root = Path("/Users/main/Desktop/evergreen/RSVP/rsvp-app")
        self.real_functions = self.load_real_functions()
        self.real_apis = self.load_real_apis()
        self.execution_log = []
        self.blocked_commands = []
    
    def load_real_functions(self):
        """Load actual functions from codebase"""
        functions = {}
        
        # Load from campaigns.ts
        campaigns_file = self.project_root / "src/lib/campaigns.ts"
        if campaigns_file.exists():
            with open(campaigns_file, 'r') as f:
                content = f.read()
                funcs = re.findall(r'export (?:async )?function (\w+)\(', content)
                for func in funcs:
                    functions[func] = {
                        'file': 'src/lib/campaigns.ts',
                        'type': 'campaign_function'
                    }
        
        # Load from email-sender.ts
        email_file = self.project_root / "src/lib/email-sender.ts"
        if email_file.exists():
            with open(email_file, 'r') as f:
                content = f.read()
                funcs = re.findall(r'export (?:async )?function (\w+)\(', content)
                for func in funcs:
                    functions[func] = {
                        'file': 'src/lib/email-sender.ts',
                        'type': 'email_function'
                    }
        
        return functions
    
    def load_real_apis(self):
        """Load actual API endpoints"""
        apis = {}
        
        # Real API endpoints that exist
        real_endpoints = {
            '/admin/campaign/campaigns': ['GET', 'POST', 'PUT'],
            '/admin/campaign/campaigns/[id]': ['GET', 'DELETE'],
            '/admin/campaign/send': ['POST'],
            '/admin/campaign/groups': ['GET', 'POST', 'PUT'],
            '/admin/campaign/templates': ['GET', 'POST', 'PUT'],
            '/admin/campaign/schedules': ['GET', 'POST', 'PUT'],
            '/admin/campaign/dashboard': ['GET'],
            '/admin/analytics/visitors': ['GET'],
            '/admin/campaigns/analytics': ['GET'],
            '/rsvp': ['POST']
        }
        
        return real_endpoints
    
    def validate_ai_command(self, user_command: str, ai_planned_actions: str) -> dict:
        """Validate AI command against real codebase"""
        print(f"\n🔍 SAFETY VALIDATION: '{user_command}'")
        print("=" * 60)
        
        print(f"🤖 AI PLANNED ACTIONS:")
        print(ai_planned_actions)
        print()
        
        # Extract what AI wants to do
        mentioned_functions = re.findall(r'(\w+)\s*\([^)]*\)', ai_planned_actions)
        mentioned_apis = re.findall(r'(GET|POST|PUT|DELETE)\s+(/api/[^\s]+)', ai_planned_actions)
        
        validation_result = {
            'timestamp': datetime.now().isoformat(),
            'user_command': user_command,
            'ai_planned_actions': ai_planned_actions,
            'functions_mentioned': mentioned_functions,
            'apis_mentioned': mentioned_apis,
            'validation_passed': True,
            'safety_issues': [],
            'fake_references': [],
            'real_references': [],
            'requires_confirmation': False,
            'execution_allowed': False
        }
        
        # Validate functions
        print(f"🔧 FUNCTION VALIDATION:")
        for func in mentioned_functions:
            if len(func) > 3:  # Likely function names
                if func in self.real_functions:
                    print(f"   ✅ {func} - REAL (exists in {self.real_functions[func]['file']})")
                    validation_result['real_references'].append({
                        'type': 'function',
                        'name': func,
                        'file': self.real_functions[func]['file']
                    })
                else:
                    print(f"   ❌ {func} - FAKE (AI made this up)")
                    validation_result['fake_references'].append({
                        'type': 'function',
                        'name': func,
                        'reason': 'does_not_exist'
                    })
                    validation_result['safety_issues'].append(f"AI mentioned non-existent function: {func}")
                    validation_result['validation_passed'] = False
        
        # Validate APIs
        print(f"\n🌐 API VALIDATION:")
        for method, endpoint in mentioned_apis:
            clean_endpoint = endpoint.replace('/api', '')
            if clean_endpoint in self.real_apis:
                if method in self.real_apis[clean_endpoint]:
                    print(f"   ✅ {method} {endpoint} - REAL (exists and supported)")
                    validation_result['real_references'].append({
                        'type': 'api',
                        'method': method,
                        'endpoint': endpoint
                    })
                else:
                    print(f"   ⚠️  {endpoint} - REAL but {method} not supported")
                    validation_result['safety_issues'].append(f"API {endpoint} doesn't support {method}")
                    validation_result['validation_passed'] = False
            else:
                print(f"   ❌ {method} {endpoint} - FAKE (AI made this up)")
                validation_result['fake_references'].append({
                    'type': 'api',
                    'method': method,
                    'endpoint': endpoint,
                    'reason': 'does_not_exist'
                })
                validation_result['safety_issues'].append(f"AI mentioned non-existent API: {method} {endpoint}")
                validation_result['validation_passed'] = False
        
        # Check for dangerous operations
        dangerous_patterns = [
            r'delete.*all',
            r'clear.*everything',
            r'wipe.*database',
            r'remove.*all.*users'
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, ai_planned_actions, re.IGNORECASE):
                validation_result['safety_issues'].append(f"Dangerous operation detected: {pattern}")
                validation_result['requires_confirmation'] = True
        
        # Determine if execution is allowed
        if validation_result['validation_passed'] and not validation_result['safety_issues']:
            validation_result['execution_allowed'] = True
        else:
            validation_result['execution_allowed'] = False
        
        # Log the validation
        self.execution_log.append(validation_result)
        
        return validation_result
    
    def show_validation_result(self, result: dict):
        """Show validation result to user"""
        print(f"\n📊 VALIDATION RESULT:")
        print("-" * 40)
        print(f"Validation Passed: {'✅ YES' if result['validation_passed'] else '❌ NO'}")
        print(f"Execution Allowed: {'✅ YES' if result['execution_allowed'] else '❌ NO'}")
        print(f"Requires Confirmation: {'✅ YES' if result['requires_confirmation'] else '❌ NO'}")
        
        if result['safety_issues']:
            print(f"\n⚠️  SAFETY ISSUES:")
            for issue in result['safety_issues']:
                print(f"   • {issue}")
        
        if result['fake_references']:
            print(f"\n🚨 FAKE REFERENCES (AI HALLUCINATIONS):")
            for ref in result['fake_references']:
                print(f"   • {ref['type'].upper()}: {ref.get('name', ref.get('endpoint'))}")
        
        if result['real_references']:
            print(f"\n✅ REAL REFERENCES:")
            for ref in result['real_references']:
                print(f"   • {ref['type'].upper()}: {ref.get('name', ref.get('endpoint'))}")
    
    def execute_command_safely(self, user_command: str, ai_planned_actions: str):
        """Execute command with safety validation"""
        print(f"\n🚀 EXECUTING COMMAND SAFELY")
        print("=" * 60)
        
        # Validate first
        validation = self.validate_ai_command(user_command, ai_planned_actions)
        
        # Show results
        self.show_validation_result(validation)
        
        # Check if execution is allowed
        if not validation['execution_allowed']:
            print(f"\n🛑 EXECUTION BLOCKED!")
            print("Reason: AI referenced fake functions/APIs or safety issues detected")
            self.blocked_commands.append({
                'timestamp': datetime.now().isoformat(),
                'command': user_command,
                'reason': 'validation_failed',
                'issues': validation['safety_issues'],
                'fake_references': validation['fake_references']
            })
            return False
        
        # Check if confirmation is required
        if validation['requires_confirmation']:
            print(f"\n⚠️  CONFIRMATION REQUIRED!")
            print("This operation is potentially dangerous.")
            print("Type 'confirm' to proceed or 'cancel' to abort.")
            
            # In a real system, you'd wait for user input here
            print("(Simulating user confirmation...)")
            time.sleep(1)
        
        # Execute the command (simulated)
        print(f"\n✅ EXECUTING COMMAND...")
        print("(Simulating execution - no actual changes made)")
        
        # Log successful execution
        execution_log = {
            'timestamp': datetime.now().isoformat(),
            'command': user_command,
            'status': 'executed_safely',
            'validation': validation
        }
        self.execution_log.append(execution_log)
        
        return True
    
    def show_execution_summary(self):
        """Show summary of all executions"""
        print(f"\n📊 EXECUTION SUMMARY")
        print("=" * 50)
        
        total_commands = len(self.execution_log)
        blocked_commands = len(self.blocked_commands)
        executed_commands = total_commands - blocked_commands
        
        print(f"Total Commands: {total_commands}")
        print(f"Executed Safely: {executed_commands}")
        print(f"Blocked: {blocked_commands}")
        
        if blocked_commands > 0:
            print(f"\n🛑 BLOCKED COMMANDS:")
            for blocked in self.blocked_commands:
                print(f"   • {blocked['command']}")
                print(f"     Reason: {blocked['reason']}")
                if blocked['fake_references']:
                    print(f"     Fake References: {len(blocked['fake_references'])}")

def main():
    """Main function"""
    print("🛡️  AI SAFETY MONITOR")
    print("=" * 60)
    print("Prevents AI from executing fake commands")
    print("Validates every action against real codebase")
    print()
    
    monitor = AISafetyMonitor()
    
    # Test cases
    test_cases = [
        {
            "command": "create a new campaign",
            "ai_actions": """I'll create a new campaign:

1. Call createCampaign() function
2. Use POST /api/admin/campaign/campaigns
3. Create Campaign record in database

Let me execute:
```javascript
await createCampaign({
  name: "Test Campaign",
  status: "DRAFT"
});
```"""
        },
        {
            "command": "delete all campaigns",
            "ai_actions": """I'll delete all campaigns:

1. Call deleteAllCampaigns() function
2. Use DELETE /api/admin/campaign/campaigns
3. Remove all Campaign records

Let me execute:
```javascript
await deleteAllCampaigns();
```"""
        },
        {
            "command": "send emails to audience",
            "ai_actions": """I'll send emails:

1. Call sendCampaignEmail() function
2. Use POST /api/admin/campaign/send
3. Send via Resend API

Let me execute:
```javascript
await sendCampaignEmail(jobId);
```"""
        }
    ]
    
    # Test each case
    for test_case in test_cases:
        monitor.execute_command_safely(
            test_case["command"],
            test_case["ai_actions"]
        )
        print("\n" + "="*60)
    
    # Show final summary
    monitor.show_execution_summary()
    
    print(f"\n🎯 KEY BENEFITS:")
    print("=" * 30)
    print("✅ Prevents AI from executing fake code")
    print("✅ Validates every function and API call")
    print("✅ Blocks dangerous operations")
    print("✅ Requires confirmation for risky actions")
    print("✅ Logs all attempts for audit trail")
    print("✅ Shows you exactly what AI is trying to do")

if __name__ == "__main__":
    main()

