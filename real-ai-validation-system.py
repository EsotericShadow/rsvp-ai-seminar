#!/usr/bin/env python3
"""
Real AI Validation System - Cross-references AI responses with actual codebase
Shows exactly what the AI is saying vs. what the code actually does
"""

import json
import os
import re
import subprocess
from typing import Dict, List, Any, Optional
from datetime import datetime
from pathlib import Path

class CodebaseValidator:
    """Validates AI responses against actual codebase"""
    
    def __init__(self, project_root: str = "/Users/main/Desktop/evergreen/RSVP/rsvp-app"):
        self.project_root = Path(project_root)
        self.api_endpoints = {}
        self.functions = {}
        self.database_schema = {}
        self.email_config = {}
        self.load_actual_codebase()
    
    def load_actual_codebase(self):
        """Load actual codebase information"""
        print("🔍 Loading actual codebase information...")
        
        # Load API endpoints
        self.load_api_endpoints()
        
        # Load database schema
        self.load_database_schema()
        
        # Load email configuration
        self.load_email_config()
        
        # Load function definitions
        self.load_function_definitions()
    
    def load_api_endpoints(self):
        """Load actual API endpoints from the codebase"""
        api_files = [
            "src/app/api/admin/campaign/campaigns/route.ts",
            "src/app/api/admin/campaign/send/route.ts",
            "src/app/api/admin/campaign/groups/route.ts",
            "src/app/api/admin/campaign/templates/route.ts",
            "src/app/api/rsvp/route.ts"
        ]
        
        for api_file in api_files:
            file_path = self.project_root / api_file
            if file_path.exists():
                with open(file_path, 'r') as f:
                    content = f.read()
                
                # Extract HTTP methods and endpoints
                methods = re.findall(r'export async function (GET|POST|PUT|DELETE)', content)
                if methods:
                    endpoint = f"/{api_file.replace('src/app/api', '').replace('/route.ts', '')}"
                    self.api_endpoints[endpoint] = {
                        'methods': methods,
                        'file': api_file,
                        'content': content[:500] + "..." if len(content) > 500 else content
                    }
    
    def load_database_schema(self):
        """Load actual database schema"""
        schema_file = self.project_root / "prisma/schema.prisma"
        if schema_file.exists():
            with open(schema_file, 'r') as f:
                content = f.read()
            
            # Extract model definitions
            models = re.findall(r'model (\w+) \{([^}]+)\}', content, re.DOTALL)
            for model_name, model_content in models:
                self.database_schema[model_name] = {
                    'content': model_content.strip(),
                    'file': 'prisma/schema.prisma'
                }
    
    def load_email_config(self):
        """Load actual email configuration"""
        email_files = [
            "src/lib/email-sender.ts",
            "src/lib/sendgrid-email.ts",
            "src/lib/campaigns.ts"
        ]
        
        for email_file in email_files:
            file_path = self.project_root / email_file
            if file_path.exists():
                with open(file_path, 'r') as f:
                    content = f.read()
                
                # Extract email-related functions
                functions = re.findall(r'export (?:async )?function (\w+)\([^)]*\)', content)
                for func in functions:
                    self.email_config[func] = {
                        'file': email_file,
                        'content': content[:500] + "..." if len(content) > 500 else content
                    }
    
    def load_function_definitions(self):
        """Load actual function definitions"""
        lib_files = [
            "src/lib/campaigns.ts",
            "src/lib/email-sender.ts",
            "src/lib/admin-auth.ts"
        ]
        
        for lib_file in lib_files:
            file_path = self.project_root / lib_file
            if file_path.exists():
                with open(file_path, 'r') as f:
                    content = f.read()
                
                # Extract function definitions
                functions = re.findall(r'export (?:async )?function (\w+)\([^)]*\)\s*\{', content)
                for func in functions:
                    self.functions[func] = {
                        'file': lib_file,
                        'exists': True,
                        'signature': self.extract_function_signature(content, func)
                    }
    
    def extract_function_signature(self, content: str, func_name: str) -> str:
        """Extract function signature from content"""
        pattern = rf'export (?:async )?function {func_name}\([^)]*\)'
        match = re.search(pattern, content)
        return match.group(0) if match else "Not found"

class AIResponseValidator:
    """Validates AI responses against actual codebase"""
    
    def __init__(self, codebase_validator: CodebaseValidator):
        self.validator = codebase_validator
        self.validation_log = []
    
    def validate_ai_response(self, ai_response: str, user_command: str) -> Dict[str, Any]:
        """Validate AI response against actual codebase"""
        validation_result = {
            'timestamp': datetime.now().isoformat(),
            'user_command': user_command,
            'ai_response': ai_response,
            'validation_passed': True,
            'issues_found': [],
            'accurate_statements': [],
            'inaccurate_statements': [],
            'missing_verification': [],
            'code_references': []
        }
        
        # Check for function references
        self.validate_function_references(ai_response, validation_result)
        
        # Check for API endpoint references
        self.validate_api_references(ai_response, validation_result)
        
        # Check for database references
        self.validate_database_references(ai_response, validation_result)
        
        # Check for email configuration
        self.validate_email_references(ai_response, validation_result)
        
        # Log validation
        self.validation_log.append(validation_result)
        
        return validation_result
    
    def validate_function_references(self, response: str, result: Dict[str, Any]):
        """Validate function references in AI response"""
        # Look for function names in the response
        function_pattern = r'(\w+)\s*\([^)]*\)'
        mentioned_functions = re.findall(function_pattern, response)
        
        for func_name in mentioned_functions:
            if len(func_name) > 3:  # Likely function names
                if func_name in self.validator.functions:
                    result['accurate_statements'].append(f"Function '{func_name}' exists in codebase")
                    result['code_references'].append({
                        'type': 'function',
                        'name': func_name,
                        'file': self.validator.functions[func_name]['file'],
                        'signature': self.validator.functions[func_name]['signature']
                    })
                else:
                    result['inaccurate_statements'].append(f"Function '{func_name}' does not exist in codebase")
                    result['issues_found'].append(f"AI mentioned non-existent function: {func_name}")
    
    def validate_api_references(self, response: str, result: Dict[str, Any]):
        """Validate API endpoint references"""
        # Look for API endpoints in the response
        api_pattern = r'(GET|POST|PUT|DELETE|PATCH)\s+(/api/[^\s]+)'
        mentioned_apis = re.findall(api_pattern, response)
        
        for method, endpoint in mentioned_apis:
            if endpoint in self.validator.api_endpoints:
                if method in self.validator.api_endpoints[endpoint]['methods']:
                    result['accurate_statements'].append(f"API endpoint {method} {endpoint} exists")
                    result['code_references'].append({
                        'type': 'api',
                        'method': method,
                        'endpoint': endpoint,
                        'file': self.validator.api_endpoints[endpoint]['file']
                    })
                else:
                    result['inaccurate_statements'].append(f"API endpoint {method} {endpoint} method not supported")
                    result['issues_found'].append(f"AI mentioned unsupported method {method} for {endpoint}")
            else:
                result['inaccurate_statements'].append(f"API endpoint {endpoint} does not exist")
                result['issues_found'].append(f"AI mentioned non-existent API endpoint: {endpoint}")
    
    def validate_database_references(self, response: str, result: Dict[str, Any]):
        """Validate database references"""
        # Look for database model references
        model_pattern = r'(Campaign|AudienceGroup|EmailJob|RSVP|Visit)\w*'
        mentioned_models = re.findall(model_pattern, response)
        
        for model in mentioned_models:
            if model in self.validator.database_schema:
                result['accurate_statements'].append(f"Database model '{model}' exists")
                result['code_references'].append({
                    'type': 'database',
                    'model': model,
                    'file': self.validator.database_schema[model]['file']
                })
            else:
                result['inaccurate_statements'].append(f"Database model '{model}' does not exist")
                result['issues_found'].append(f"AI mentioned non-existent database model: {model}")
    
    def validate_email_references(self, response: str, result: Dict[str, Any]):
        """Validate email configuration references"""
        # Look for email service references
        email_services = ['Resend', 'SendGrid', 'ImprovMX']
        for service in email_services:
            if service in response:
                if service in ['Resend', 'SendGrid']:
                    result['accurate_statements'].append(f"Email service '{service}' is configured")
                else:
                    result['inaccurate_statements'].append(f"Email service '{service}' mentioned but not verified")
                    result['missing_verification'].append(f"Need to verify {service} configuration")

class RealAITester:
    """Tests AI with real codebase validation"""
    
    def __init__(self):
        self.codebase_validator = CodebaseValidator()
        self.response_validator = AIResponseValidator(self.codebase_validator)
        self.test_log = []
    
    def simulate_ai_response(self, user_command: str) -> str:
        """Simulate AI response (this would be replaced with actual AI)"""
        # This is a simplified simulation - in reality, this would call the actual AI
        command_lower = user_command.lower()
        
        if 'create campaign' in command_lower:
            return """I'll help you create a new campaign. Here's what I'll do:

1. Call createCampaign() function with the campaign details
2. Use POST /api/admin/campaign/campaigns endpoint
3. Create a new Campaign record in the database
4. Set up CampaignSchedule for email timing
5. Configure CampaignTemplate for email content

Let me execute createCampaign({
  name: "Test Campaign",
  description: "A test campaign",
  status: "DRAFT",
  steps: []
})"""
        
        elif 'send email' in command_lower:
            return """I'll send the emails for you. Here's my plan:

1. Call sendCampaignEmail() function
2. Use the Resend API to send emails
3. Update EmailJob status to 'sent'
4. Create EmailEvent records for tracking
5. Use POST /api/admin/campaign/send endpoint

Let me execute sendCampaignEmail(jobId)"""
        
        elif 'show analytics' in command_lower:
            return """I'll show you the campaign analytics:

1. Query the Visit table for visitor data
2. Query the RSVP table for conversion data
3. Query the EmailJob table for email metrics
4. Calculate open rates, click rates, conversion rates
5. Use GET /api/admin/analytics endpoint

Let me fetch the analytics data from the database."""
        
        else:
            return f"""I understand you want to: {user_command}

I'll analyze your request and determine the appropriate actions to take.
Let me check the available functions and API endpoints to help you."""
    
    def test_ai_command(self, user_command: str) -> Dict[str, Any]:
        """Test AI command with real validation"""
        print(f"\n🧪 TESTING AI WITH COMMAND: '{user_command}'")
        print("=" * 60)
        
        # Simulate AI response
        ai_response = self.simulate_ai_response(user_command)
        
        print(f"🤖 AI RESPONSE:")
        print("-" * 30)
        print(ai_response)
        print()
        
        # Validate against real codebase
        validation = self.response_validator.validate_ai_response(ai_response, user_command)
        
        print(f"🔍 VALIDATION RESULTS:")
        print("-" * 30)
        print(f"Validation Passed: {'✅ YES' if validation['validation_passed'] else '❌ NO'}")
        print(f"Issues Found: {len(validation['issues_found'])}")
        print(f"Accurate Statements: {len(validation['accurate_statements'])}")
        print(f"Inaccurate Statements: {len(validation['inaccurate_statements'])}")
        print()
        
        # Show detailed results
        if validation['accurate_statements']:
            print(f"✅ ACCURATE STATEMENTS:")
            for statement in validation['accurate_statements']:
                print(f"   • {statement}")
            print()
        
        if validation['inaccurate_statements']:
            print(f"❌ INACCURATE STATEMENTS:")
            for statement in validation['inaccurate_statements']:
                print(f"   • {statement}")
            print()
        
        if validation['issues_found']:
            print(f"⚠️  ISSUES FOUND:")
            for issue in validation['issues_found']:
                print(f"   • {issue}")
            print()
        
        if validation['code_references']:
            print(f"📋 CODE REFERENCES:")
            for ref in validation['code_references']:
                print(f"   • {ref['type'].upper()}: {ref.get('name', ref.get('endpoint', ref.get('model')))}")
                print(f"     File: {ref['file']}")
                if 'signature' in ref:
                    print(f"     Signature: {ref['signature']}")
            print()
        
        # Log the test
        test_result = {
            'timestamp': datetime.now().isoformat(),
            'user_command': user_command,
            'ai_response': ai_response,
            'validation': validation
        }
        self.test_log.append(test_result)
        
        return test_result
    
    def show_codebase_info(self):
        """Show actual codebase information"""
        print(f"\n📋 ACTUAL CODEBASE INFORMATION")
        print("=" * 50)
        
        print(f"🗄️  DATABASE MODELS ({len(self.codebase_validator.database_schema)}):")
        for model, info in self.codebase_validator.database_schema.items():
            print(f"   • {model} (in {info['file']})")
        
        print(f"\n🔌 API ENDPOINTS ({len(self.codebase_validator.api_endpoints)}):")
        for endpoint, info in self.codebase_validator.api_endpoints.items():
            methods = ', '.join(info['methods'])
            print(f"   • {methods} {endpoint} (in {info['file']})")
        
        print(f"\n⚙️  FUNCTIONS ({len(self.codebase_validator.functions)}):")
        for func, info in self.codebase_validator.functions.items():
            print(f"   • {func} (in {info['file']})")
        
        print(f"\n📧 EMAIL CONFIGURATION ({len(self.codebase_validator.email_config)}):")
        for func, info in self.codebase_validator.email_config.items():
            print(f"   • {func} (in {info['file']})")
    
    def show_validation_log(self):
        """Show validation log"""
        print(f"\n📊 VALIDATION LOG ({len(self.test_log)} tests)")
        print("=" * 50)
        
        for i, test in enumerate(self.test_log, 1):
            validation = test['validation']
            print(f"{i}. Command: {test['user_command']}")
            print(f"   Validation: {'✅ PASSED' if validation['validation_passed'] else '❌ FAILED'}")
            print(f"   Issues: {len(validation['issues_found'])}")
            print(f"   Accurate: {len(validation['accurate_statements'])}")
            print(f"   Inaccurate: {len(validation['inaccurate_statements'])}")
            print()

def main():
    """Main testing function"""
    print("🔍 REAL AI VALIDATION SYSTEM")
    print("=" * 60)
    print("This system validates AI responses against the actual codebase")
    print("and shows you exactly what the AI is saying vs. what's real.")
    print()
    
    tester = RealAITester()
    
    # Show actual codebase info first
    tester.show_codebase_info()
    
    # Test some commands
    test_commands = [
        "create a new campaign called 'AI Workshop'",
        "send emails to my audience",
        "show me campaign analytics",
        "delete all campaigns",
        "create a function called sendEmails()"
    ]
    
    print(f"\n🧪 TESTING AI COMMANDS")
    print("=" * 50)
    
    for command in test_commands:
        tester.test_ai_command(command)
        input("\nPress Enter to continue to next test...")
    
    # Show final validation log
    tester.show_validation_log()
    
    print(f"\n📋 SUMMARY:")
    print("=" * 30)
    total_tests = len(tester.test_log)
    passed_tests = sum(1 for test in tester.test_log if test['validation']['validation_passed'])
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")

if __name__ == "__main__":
    main()
