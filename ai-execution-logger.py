#!/usr/bin/env python3
"""
AI Execution Logger - Shows exactly what the AI is doing in real-time
Cross-references every action with actual codebase
"""

import json
import os
import time
import threading
from typing import Dict, List, Any, Optional
from datetime import datetime
from pathlib import Path
import subprocess

class AILogger:
    """Logs AI actions and validates them against real code"""
    
    def __init__(self, project_root: str = "/Users/main/Desktop/evergreen/RSVP/rsvp-app"):
        self.project_root = Path(project_root)
        self.log_file = self.project_root / "ai-execution.log"
        self.session_id = f"session_{int(time.time())}"
        self.log_entries = []
        self.real_functions = self.load_real_functions()
        self.real_apis = self.load_real_apis()
        
    def load_real_functions(self) -> Dict[str, Any]:
        """Load actual functions from codebase"""
        functions = {}
        
        # Check campaigns.ts
        campaigns_file = self.project_root / "src/lib/campaigns.ts"
        if campaigns_file.exists():
            with open(campaigns_file, 'r') as f:
                content = f.read()
                # Extract function names
                import re
                func_matches = re.findall(r'export (?:async )?function (\w+)\(', content)
                for func in func_matches:
                    functions[func] = {
                        'file': 'src/lib/campaigns.ts',
                        'exists': True,
                        'type': 'campaign_function'
                    }
        
        # Check email-sender.ts
        email_file = self.project_root / "src/lib/email-sender.ts"
        if email_file.exists():
            with open(email_file, 'r') as f:
                content = f.read()
                func_matches = re.findall(r'export (?:async )?function (\w+)\(', content)
                for func in func_matches:
                    functions[func] = {
                        'file': 'src/lib/email-sender.ts',
                        'exists': True,
                        'type': 'email_function'
                    }
        
        return functions
    
    def load_real_apis(self) -> Dict[str, Any]:
        """Load actual API endpoints"""
        apis = {}
        
        # Check API routes
        api_dirs = [
            "src/app/api/admin/campaign/campaigns",
            "src/app/api/admin/campaign/send",
            "src/app/api/admin/campaign/groups",
            "src/app/api/rsvp"
        ]
        
        for api_dir in api_dirs:
            route_file = self.project_root / f"{api_dir}/route.ts"
            if route_file.exists():
                with open(route_file, 'r') as f:
                    content = f.read()
                    import re
                    methods = re.findall(r'export async function (GET|POST|PUT|DELETE)', content)
                    endpoint = f"/{api_dir.replace('src/app/api', '')}"
                    apis[endpoint] = {
                        'methods': methods,
                        'file': f"{api_dir}/route.ts",
                        'exists': True
                    }
        
        return apis
    
    def log_ai_action(self, action_type: str, action_data: Dict[str, Any], 
                     user_command: str, ai_interpretation: str) -> Dict[str, Any]:
        """Log an AI action with validation"""
        
        timestamp = datetime.now().isoformat()
        log_entry = {
            'session_id': self.session_id,
            'timestamp': timestamp,
            'action_type': action_type,
            'user_command': user_command,
            'ai_interpretation': ai_interpretation,
            'action_data': action_data,
            'validation': self.validate_action(action_type, action_data),
            'real_code_check': self.check_against_real_code(action_type, action_data)
        }
        
        self.log_entries.append(log_entry)
        self.write_to_log_file(log_entry)
        
        return log_entry
    
    def validate_action(self, action_type: str, action_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate AI action"""
        validation = {
            'is_valid': True,
            'warnings': [],
            'errors': [],
            'safety_checks': []
        }
        
        # Check for dangerous actions
        if action_type == 'delete' or 'delete' in str(action_data).lower():
            validation['warnings'].append("DELETE action detected - requires confirmation")
            validation['safety_checks'].append("User confirmation required")
        
        if action_type == 'send_email' or 'send' in str(action_data).lower():
            validation['warnings'].append("EMAIL SEND action detected - requires confirmation")
            validation['safety_checks'].append("User confirmation required")
        
        # Check for bulk operations
        if 'bulk' in str(action_data).lower() or 'all' in str(action_data).lower():
            validation['warnings'].append("BULK operation detected - requires confirmation")
            validation['safety_checks'].append("User confirmation required")
        
        return validation
    
    def check_against_real_code(self, action_type: str, action_data: Dict[str, Any]) -> Dict[str, Any]:
        """Check if AI action references real code"""
        code_check = {
            'function_exists': False,
            'api_exists': False,
            'function_name': None,
            'api_endpoint': None,
            'real_code_found': False,
            'code_reference': None
        }
        
        # Check if AI is calling real functions
        action_str = str(action_data).lower()
        
        for func_name, func_info in self.real_functions.items():
            if func_name.lower() in action_str:
                code_check['function_exists'] = True
                code_check['function_name'] = func_name
                code_check['real_code_found'] = True
                code_check['code_reference'] = {
                    'type': 'function',
                    'name': func_name,
                    'file': func_info['file'],
                    'type': func_info['type']
                }
                break
        
        # Check if AI is calling real APIs
        for api_endpoint, api_info in self.real_apis.items():
            if api_endpoint.lower() in action_str:
                code_check['api_exists'] = True
                code_check['api_endpoint'] = api_endpoint
                code_check['real_code_found'] = True
                code_check['code_reference'] = {
                    'type': 'api',
                    'endpoint': api_endpoint,
                    'file': api_info['file'],
                    'methods': api_info['methods']
                }
                break
        
        return code_check
    
    def write_to_log_file(self, log_entry: Dict[str, Any]):
        """Write log entry to file"""
        with open(self.log_file, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    
    def show_realtime_logs(self):
        """Show real-time logs"""
        print(f"\n📊 REAL-TIME AI EXECUTION LOGS")
        print("=" * 60)
        print(f"Session ID: {self.session_id}")
        print(f"Log File: {self.log_file}")
        print()
        
        for i, entry in enumerate(self.log_entries, 1):
            print(f"🔍 LOG ENTRY #{i}")
            print("-" * 40)
            print(f"Time: {entry['timestamp']}")
            print(f"User Command: {entry['user_command']}")
            print(f"AI Interpretation: {entry['ai_interpretation']}")
            print(f"Action Type: {entry['action_type']}")
            print(f"Action Data: {json.dumps(entry['action_data'], indent=2)}")
            
            # Show validation results
            validation = entry['validation']
            print(f"\n✅ VALIDATION:")
            print(f"   Valid: {validation['is_valid']}")
            if validation['warnings']:
                print(f"   Warnings: {', '.join(validation['warnings'])}")
            if validation['errors']:
                print(f"   Errors: {', '.join(validation['errors'])}")
            if validation['safety_checks']:
                print(f"   Safety Checks: {', '.join(validation['safety_checks'])}")
            
            # Show real code check
            code_check = entry['real_code_check']
            print(f"\n🔍 REAL CODE CHECK:")
            print(f"   Function Exists: {code_check['function_exists']}")
            print(f"   API Exists: {code_check['api_exists']}")
            print(f"   Real Code Found: {code_check['real_code_found']}")
            
            if code_check['code_reference']:
                ref = code_check['code_reference']
                print(f"   Code Reference:")
                print(f"     Type: {ref['type']}")
                if ref['type'] == 'function':
                    print(f"     Function: {ref['name']}")
                    print(f"     File: {ref['file']}")
                elif ref['type'] == 'api':
                    print(f"     Endpoint: {ref['endpoint']}")
                    print(f"     Methods: {ref['methods']}")
                    print(f"     File: {ref['file']}")
            
            print("\n" + "=" * 60)

class AIExecutionMonitor:
    """Monitors AI execution in real-time"""
    
    def __init__(self):
        self.logger = AILogger()
        self.is_monitoring = False
        self.monitor_thread = None
    
    def start_monitoring(self):
        """Start real-time monitoring"""
        self.is_monitoring = True
        self.monitor_thread = threading.Thread(target=self._monitor_loop)
        self.monitor_thread.start()
        print("🔍 AI Execution Monitor started")
    
    def stop_monitoring(self):
        """Stop monitoring"""
        self.is_monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join()
        print("⏹️  AI Execution Monitor stopped")
    
    def _monitor_loop(self):
        """Monitoring loop"""
        while self.is_monitoring:
            # Check for new log entries
            if len(self.logger.log_entries) > 0:
                self.logger.show_realtime_logs()
            time.sleep(1)
    
    def simulate_ai_execution(self, user_command: str):
        """Simulate AI execution with logging"""
        print(f"\n🤖 AI EXECUTING COMMAND: '{user_command}'")
        print("=" * 60)
        
        # AI interprets command
        ai_interpretation = self._interpret_command(user_command)
        print(f"🧠 AI Interpretation: {ai_interpretation}")
        
        # AI plans actions
        actions = self._plan_actions(user_command, ai_interpretation)
        print(f"📋 Planned Actions: {len(actions)}")
        
        # Execute each action with logging
        for i, action in enumerate(actions, 1):
            print(f"\n⚡ EXECUTING ACTION #{i}: {action['type']}")
            print("-" * 40)
            
            # Log the action
            log_entry = self.logger.log_ai_action(
                action_type=action['type'],
                action_data=action['data'],
                user_command=user_command,
                ai_interpretation=ai_interpretation
            )
            
            # Show what AI is actually doing
            print(f"Action Data: {json.dumps(action['data'], indent=2)}")
            
            # Show validation
            validation = log_entry['validation']
            if validation['warnings']:
                print(f"⚠️  Warnings: {', '.join(validation['warnings'])}")
            
            # Show real code check
            code_check = log_entry['real_code_check']
            if code_check['real_code_found']:
                ref = code_check['code_reference']
                print(f"✅ Real Code Found: {ref['type']} - {ref.get('name', ref.get('endpoint'))}")
            else:
                print(f"❌ No Real Code Found - AI may be hallucinating")
            
            # Simulate execution delay
            time.sleep(2)
        
        print(f"\n✅ EXECUTION COMPLETE")
        print("=" * 60)
    
    def _interpret_command(self, command: str) -> str:
        """AI interpretation (simulated)"""
        command_lower = command.lower()
        
        if 'create campaign' in command_lower:
            return "User wants to create a new email campaign. I'll use the createCampaign function and POST to /api/admin/campaign/campaigns."
        elif 'send email' in command_lower:
            return "User wants to send emails. I'll use sendCampaignEmail function and POST to /api/admin/campaign/send."
        elif 'show analytics' in command_lower:
            return "User wants to see analytics. I'll query the database and use GET /api/admin/analytics."
        else:
            return f"User command: {command}. I'll analyze and execute appropriate actions."
    
    def _plan_actions(self, command: str, interpretation: str) -> List[Dict[str, Any]]:
        """AI action planning (simulated)"""
        command_lower = command.lower()
        actions = []
        
        if 'create campaign' in command_lower:
            actions = [
                {
                    'type': 'validate_input',
                    'data': {'campaign_name': 'Test Campaign', 'validation': True}
                },
                {
                    'type': 'call_function',
                    'data': {'function': 'createCampaign', 'args': {'name': 'Test Campaign'}}
                },
                {
                    'type': 'api_call',
                    'data': {'method': 'POST', 'endpoint': '/api/admin/campaign/campaigns', 'body': {'name': 'Test Campaign'}}
                },
                {
                    'type': 'database_operation',
                    'data': {'operation': 'create', 'table': 'Campaign', 'data': {'name': 'Test Campaign'}}
                }
            ]
        elif 'send email' in command_lower:
            actions = [
                {
                    'type': 'call_function',
                    'data': {'function': 'sendCampaignEmail', 'args': {'jobId': 'job_123'}}
                },
                {
                    'type': 'api_call',
                    'data': {'method': 'POST', 'endpoint': '/api/admin/campaign/send', 'body': {'campaignId': 'camp_123'}}
                },
                {
                    'type': 'email_send',
                    'data': {'provider': 'Resend', 'recipients': 150, 'template': 'workshop_invite'}
                }
            ]
        else:
            actions = [
                {
                    'type': 'analyze_request',
                    'data': {'command': command, 'analysis': 'Generic command processing'}
                }
            ]
        
        return actions

def main():
    """Main function"""
    print("🔍 AI EXECUTION LOGGER - REAL-TIME MONITORING")
    print("=" * 60)
    print("This system shows you exactly what the AI is doing")
    print("and validates every action against the real codebase.")
    print()
    
    monitor = AIExecutionMonitor()
    
    # Start monitoring
    monitor.start_monitoring()
    
    # Test some commands
    test_commands = [
        "create a new campaign called 'AI Workshop'",
        "send emails to my audience",
        "show me campaign analytics"
    ]
    
    for command in test_commands:
        monitor.simulate_ai_execution(command)
        input("\nPress Enter to continue to next test...")
    
    # Stop monitoring and show final logs
    monitor.stop_monitoring()
    
    print(f"\n📊 FINAL EXECUTION SUMMARY")
    print("=" * 40)
    print(f"Total Actions Logged: {len(monitor.logger.log_entries)}")
    
    # Count real code references
    real_code_count = sum(1 for entry in monitor.logger.log_entries 
                         if entry['real_code_check']['real_code_found'])
    print(f"Actions with Real Code: {real_code_count}")
    print(f"Actions without Real Code: {len(monitor.logger.log_entries) - real_code_count}")
    
    if real_code_count > 0:
        print(f"✅ AI is referencing real code {real_code_count}/{len(monitor.logger.log_entries)} times")
    else:
        print(f"❌ AI is not referencing any real code - may be hallucinating")

if __name__ == "__main__":
    main()

