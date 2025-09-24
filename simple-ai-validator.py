#!/usr/bin/env python3
"""
Simple AI Validator - Quick and direct validation of AI responses
"""

import json
import os
from pathlib import Path

def load_real_codebase():
    """Load actual codebase information quickly"""
    project_root = Path("/Users/main/Desktop/evergreen/RSVP/rsvp-app")
    
    real_functions = {}
    real_apis = {}
    
    # Load functions from campaigns.ts
    campaigns_file = project_root / "src/lib/campaigns.ts"
    if campaigns_file.exists():
        with open(campaigns_file, 'r') as f:
            content = f.read()
            import re
            functions = re.findall(r'export (?:async )?function (\w+)\(', content)
            for func in functions:
                real_functions[func] = "src/lib/campaigns.ts"
    
    # Load functions from email-sender.ts
    email_file = project_root / "src/lib/email-sender.ts"
    if email_file.exists():
        with open(email_file, 'r') as f:
            content = f.read()
            import re
            functions = re.findall(r'export (?:async )?function (\w+)\(', content)
            for func in functions:
                real_functions[func] = "src/lib/email-sender.ts"
    
    # Load API endpoints
    api_files = [
        "src/app/api/admin/campaign/campaigns/route.ts",
        "src/app/api/admin/campaign/send/route.ts",
        "src/app/api/rsvp/route.ts"
    ]
    
    for api_file in api_files:
        full_path = project_root / api_file
        if full_path.exists():
            with open(full_path, 'r') as f:
                content = f.read()
                import re
                methods = re.findall(r'export async function (GET|POST|PUT|DELETE)', content)
                if methods:
                    endpoint = f"/{api_file.replace('src/app/api', '').replace('/route.ts', '')}"
                    real_apis[endpoint] = {
                        'methods': methods,
                        'file': api_file
                    }
    
    return real_functions, real_apis

def validate_ai_response(ai_response, real_functions, real_apis):
    """Validate AI response against real code"""
    print(f"🔍 VALIDATING AI RESPONSE")
    print("-" * 40)
    
    issues = []
    accurate = []
    
    # Check function references
    import re
    function_calls = re.findall(r'(\w+)\s*\([^)]*\)', ai_response)
    
    for func in function_calls:
        if len(func) > 3:  # Likely function names
            if func in real_functions:
                accurate.append(f"✅ Function '{func}' exists in {real_functions[func]}")
            else:
                issues.append(f"❌ Function '{func}' does NOT exist in codebase")
    
    # Check API references
    api_calls = re.findall(r'(GET|POST|PUT|DELETE)\s+(/api/[^\s]+)', ai_response)
    
    for method, endpoint in api_calls:
        if endpoint in real_apis:
            if method in real_apis[endpoint]['methods']:
                accurate.append(f"✅ API {method} {endpoint} exists in {real_apis[endpoint]['file']}")
            else:
                issues.append(f"❌ API {method} {endpoint} method not supported")
        else:
            issues.append(f"❌ API {endpoint} does NOT exist")
    
    return issues, accurate

def simulate_ai_response(command):
    """Simulate AI response"""
    command_lower = command.lower()
    
    if 'create campaign' in command_lower:
        return """I'll create a new campaign:

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
    
    elif 'send email' in command_lower:
        return """I'll send emails:

1. Call sendCampaignEmail() function
2. Use POST /api/admin/campaign/send
3. Send via Resend API

Let me execute:
```javascript
await sendCampaignEmail(jobId);
```"""
    
    elif 'delete all' in command_lower:
        return """I'll delete all campaigns:

1. Call deleteAllCampaigns() function
2. Use DELETE /api/admin/campaign/campaigns
3. Remove all Campaign records

Let me execute:
```javascript
await deleteAllCampaigns();
```"""
    
    else:
        return f"I'll help you with: {command}\nLet me analyze and execute the appropriate actions."

def main():
    """Main function"""
    print("🔍 SIMPLE AI VALIDATOR")
    print("=" * 50)
    print("Loading real codebase...")
    
    # Load real code
    real_functions, real_apis = load_real_codebase()
    
    print(f"✅ Loaded {len(real_functions)} functions, {len(real_apis)} APIs")
    
    print(f"\n🔧 REAL FUNCTIONS:")
    for func, file in real_functions.items():
        print(f"   • {func} (in {file})")
    
    print(f"\n🌐 REAL APIs:")
    for endpoint, info in real_apis.items():
        methods = ', '.join(info['methods'])
        print(f"   • {methods} {endpoint}")
    
    # Test commands
    test_commands = [
        "create a new campaign",
        "send emails to audience",
        "delete all campaigns"
    ]
    
    print(f"\n🧪 TESTING AI RESPONSES")
    print("=" * 50)
    
    for command in test_commands:
        print(f"\n📝 COMMAND: '{command}'")
        print("-" * 30)
        
        # Get AI response
        ai_response = simulate_ai_response(command)
        print(f"🤖 AI RESPONSE:")
        print(ai_response)
        
        # Validate response
        issues, accurate = validate_ai_response(ai_response, real_functions, real_apis)
        
        print(f"\n📊 VALIDATION RESULTS:")
        for item in accurate:
            print(f"   {item}")
        for item in issues:
            print(f"   {item}")
        
        print(f"\nAccuracy: {len(accurate)}/{len(accurate) + len(issues)} statements correct")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    main()
