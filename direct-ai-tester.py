#!/usr/bin/env python3
"""
Direct AI Tester - Shows exactly what AI is doing vs real code
"""

import json
import re
from pathlib import Path

def load_real_code():
    """Load actual codebase"""
    project_root = Path("/Users/main/Desktop/evergreen/RSVP/rsvp-app")
    
    functions = {}
    apis = {}
    
    # Load functions
    files_to_check = [
        "src/lib/campaigns.ts",
        "src/lib/email-sender.ts",
        "src/lib/sendgrid-email.ts"
    ]
    
    for file_path in files_to_check:
        full_path = project_root / file_path
        if full_path.exists():
            with open(full_path, 'r') as f:
                content = f.read()
                funcs = re.findall(r'export (?:async )?function (\w+)\(', content)
                for func in funcs:
                    functions[func] = file_path
    
    # Load APIs
    api_files = [
        "src/app/api/admin/campaign/campaigns/route.ts",
        "src/app/api/admin/campaign/send/route.ts",
        "src/app/api/admin/campaign/groups/route.ts",
        "src/app/api/admin/campaign/templates/route.ts",
        "src/app/api/rsvp/route.ts"
    ]
    
    for api_file in api_files:
        full_path = project_root / api_file
        if full_path.exists():
            with open(full_path, 'r') as f:
                content = f.read()
                methods = re.findall(r'export async function (GET|POST|PUT|DELETE)', content)
                if methods:
                    endpoint = f"/{api_file.replace('src/app/api', '').replace('/route.ts', '')}"
                    apis[endpoint] = methods
    
    return functions, apis

def test_ai_response(command, ai_response, real_functions, real_apis):
    """Test AI response against real code"""
    print(f"\n🧪 TESTING: '{command}'")
    print("=" * 60)
    
    print(f"🤖 AI SAID:")
    print(ai_response)
    print()
    
    # Check what AI mentioned
    mentioned_functions = re.findall(r'(\w+)\s*\([^)]*\)', ai_response)
    mentioned_apis = re.findall(r'(GET|POST|PUT|DELETE)\s+(/api/[^\s]+)', ai_response)
    
    print(f"🔍 AI MENTIONED:")
    print(f"   Functions: {mentioned_functions}")
    print(f"   APIs: {mentioned_apis}")
    print()
    
    # Validate functions
    print(f"✅ FUNCTION VALIDATION:")
    for func in mentioned_functions:
        if len(func) > 3:  # Likely function names
            if func in real_functions:
                print(f"   ✅ {func} - EXISTS in {real_functions[func]}")
            else:
                print(f"   ❌ {func} - DOES NOT EXIST (AI is hallucinating)")
    
    # Validate APIs
    print(f"\n✅ API VALIDATION:")
    for method, endpoint in mentioned_apis:
        if endpoint in real_apis:
            if method in real_apis[endpoint]:
                print(f"   ✅ {method} {endpoint} - EXISTS and SUPPORTED")
            else:
                print(f"   ⚠️  {endpoint} - EXISTS but {method} not supported")
        else:
            print(f"   ❌ {method} {endpoint} - DOES NOT EXIST (AI is hallucinating)")
    
    # Calculate accuracy
    total_mentions = len([f for f in mentioned_functions if len(f) > 3]) + len(mentioned_apis)
    accurate_mentions = 0
    
    for func in mentioned_functions:
        if len(func) > 3 and func in real_functions:
            accurate_mentions += 1
    
    for method, endpoint in mentioned_apis:
        if endpoint in real_apis and method in real_apis[endpoint]:
            accurate_mentions += 1
    
    accuracy = (accurate_mentions / total_mentions * 100) if total_mentions > 0 else 0
    
    print(f"\n📊 ACCURACY: {accuracy:.1f}% ({accurate_mentions}/{total_mentions})")
    
    if accuracy == 100:
        print("🎯 AI is 100% accurate - all references are real!")
    elif accuracy >= 80:
        print("✅ AI is mostly accurate")
    elif accuracy >= 50:
        print("⚠️  AI has some accuracy issues")
    else:
        print("❌ AI is hallucinating - many false references")

def main():
    """Main testing function"""
    print("🔍 DIRECT AI TESTER")
    print("=" * 60)
    print("Shows exactly what AI is saying vs. what's actually in the code")
    print()
    
    # Load real code
    real_functions, real_apis = load_real_code()
    
    print(f"📋 REAL CODEBASE:")
    print(f"   Functions: {len(real_functions)}")
    print(f"   APIs: {len(real_apis)}")
    print()
    
    # Test cases with different AI responses
    test_cases = [
        {
            "command": "create a new campaign",
            "ai_response": """I'll create a new campaign:

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
            "command": "send emails to audience",
            "ai_response": """I'll send emails:

1. Call sendCampaignEmail() function
2. Use POST /api/admin/campaign/send
3. Send via Resend API

Let me execute:
```javascript
await sendCampaignEmail(jobId);
```"""
        },
        {
            "command": "delete all campaigns",
            "ai_response": """I'll delete all campaigns:

1. Call deleteAllCampaigns() function
2. Use DELETE /api/admin/campaign/campaigns
3. Remove all Campaign records

Let me execute:
```javascript
await deleteAllCampaigns();
```"""
        },
        {
            "command": "show analytics",
            "ai_response": """I'll show analytics:

1. Call getAnalytics() function
2. Use GET /api/admin/analytics
3. Query Visit and RSVP tables

Let me execute:
```javascript
const analytics = await getAnalytics();
```"""
        }
    ]
    
    # Run tests
    for test_case in test_cases:
        test_ai_response(
            test_case["command"],
            test_case["ai_response"],
            real_functions,
            real_apis
        )
        print("\n" + "="*60)
    
    print(f"\n🎯 SUMMARY:")
    print("This system shows you EXACTLY what the AI is referencing")
    print("and validates every function call and API endpoint against")
    print("the real codebase. No more guessing!")

if __name__ == "__main__":
    main()

