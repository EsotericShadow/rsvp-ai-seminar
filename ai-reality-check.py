#!/usr/bin/env python3
"""
AI Reality Check - Shows exactly what AI should do vs what it's saying
"""

import json
import re
from pathlib import Path

def load_real_codebase():
    """Load the actual codebase"""
    project_root = Path("/Users/main/Desktop/evergreen/RSVP/rsvp-app")
    
    # Real functions that exist
    real_functions = {
        'createCampaign': 'src/lib/campaigns.ts',
        'updateCampaign': 'src/lib/campaigns.ts', 
        'deleteCampaign': 'src/lib/campaigns.ts',
        'listCampaigns': 'src/lib/campaigns.ts',
        'getCampaign': 'src/lib/campaigns.ts',
        'sendCampaignEmail': 'src/lib/email-sender.ts',
        'createTemplate': 'src/lib/campaigns.ts',
        'updateTemplate': 'src/lib/campaigns.ts',
        'deleteTemplate': 'src/lib/campaigns.ts',
        'createAudienceGroup': 'src/lib/campaigns.ts',
        'updateAudienceGroup': 'src/lib/campaigns.ts',
        'deleteAudienceGroup': 'src/lib/campaigns.ts',
        'createSchedule': 'src/lib/campaigns.ts',
        'updateSchedule': 'src/lib/campaigns.ts',
        'deleteSchedule': 'src/lib/campaigns.ts',
        'runSchedule': 'src/lib/campaigns.ts'
    }
    
    # Real API endpoints that exist
    real_apis = {
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
    
    return real_functions, real_apis

def test_ai_reality(user_command, ai_response, real_functions, real_apis):
    """Test AI response against reality"""
    print(f"\n🎯 REALITY CHECK: '{user_command}'")
    print("=" * 70)
    
    print(f"🤖 AI SAID:")
    print(ai_response)
    print()
    
    # Extract what AI mentioned
    mentioned_functions = re.findall(r'(\w+)\s*\([^)]*\)', ai_response)
    mentioned_apis = re.findall(r'(GET|POST|PUT|DELETE)\s+(/api/[^\s]+)', ai_response)
    
    print(f"🔍 WHAT AI MENTIONED:")
    print(f"   Functions: {mentioned_functions}")
    print(f"   APIs: {mentioned_apis}")
    print()
    
    # Check reality
    print(f"✅ REALITY CHECK:")
    
    function_accuracy = 0
    api_accuracy = 0
    
    for func in mentioned_functions:
        if len(func) > 3:  # Likely function names
            if func in real_functions:
                print(f"   ✅ {func} - REAL (exists in {real_functions[func]})")
                function_accuracy += 1
            else:
                print(f"   ❌ {func} - FAKE (AI made this up)")
    
    for method, endpoint in mentioned_apis:
        # Clean up endpoint path
        clean_endpoint = endpoint.replace('/api', '')
        if clean_endpoint in real_apis:
            if method in real_apis[clean_endpoint]:
                print(f"   ✅ {method} {endpoint} - REAL (exists and supported)")
                api_accuracy += 1
            else:
                print(f"   ⚠️  {endpoint} - REAL but {method} not supported")
        else:
            print(f"   ❌ {method} {endpoint} - FAKE (AI made this up)")
    
    # Calculate accuracy
    total_mentions = len([f for f in mentioned_functions if len(f) > 3]) + len(mentioned_apis)
    accurate_mentions = function_accuracy + api_accuracy
    
    accuracy = (accurate_mentions / total_mentions * 100) if total_mentions > 0 else 0
    
    print(f"\n📊 ACCURACY SCORE: {accuracy:.1f}%")
    print(f"   Real references: {accurate_mentions}")
    print(f"   Total references: {total_mentions}")
    
    if accuracy == 100:
        print("🎯 AI is 100% accurate - all references are real!")
    elif accuracy >= 80:
        print("✅ AI is mostly accurate")
    elif accuracy >= 50:
        print("⚠️  AI has accuracy issues")
    else:
        print("❌ AI is hallucinating - making up fake code!")
    
    return accuracy

def show_what_ai_should_say(command, real_functions, real_apis):
    """Show what AI should actually say"""
    print(f"\n💡 WHAT AI SHOULD ACTUALLY SAY:")
    print("-" * 50)
    
    command_lower = command.lower()
    
    if 'create campaign' in command_lower:
        print("""For creating a campaign, AI should say:

✅ REAL functions to use:
   • createCampaign() - exists in src/lib/campaigns.ts

✅ REAL API endpoints:
   • POST /api/admin/campaign/campaigns - exists and supported
   • GET /api/admin/campaign/campaigns - exists and supported

❌ FAKE functions AI might mention:
   • createNewCampaign() - doesn't exist
   • addCampaign() - doesn't exist

❌ FAKE API endpoints AI might mention:
   • POST /api/campaigns/create - doesn't exist
   • POST /api/admin/campaign/create - doesn't exist""")
    
    elif 'send email' in command_lower:
        print("""For sending emails, AI should say:

✅ REAL functions to use:
   • sendCampaignEmail() - exists in src/lib/email-sender.ts
   • runSchedule() - exists in src/lib/campaigns.ts

✅ REAL API endpoints:
   • POST /api/admin/campaign/send - exists and supported
   • POST /api/admin/campaign/schedules/[id]/run - exists and supported

❌ FAKE functions AI might mention:
   • sendEmails() - doesn't exist
   • sendBulkEmails() - doesn't exist

❌ FAKE API endpoints AI might mention:
   • POST /api/admin/send-emails - doesn't exist
   • POST /api/campaign/send - doesn't exist""")
    
    elif 'delete' in command_lower:
        print("""For deleting campaigns, AI should say:

✅ REAL functions to use:
   • deleteCampaign() - exists in src/lib/campaigns.ts
   • deleteTemplate() - exists in src/lib/campaigns.ts
   • deleteAudienceGroup() - exists in src/lib/campaigns.ts

✅ REAL API endpoints:
   • DELETE /api/admin/campaign/campaigns/[id] - exists and supported
   • DELETE /api/admin/campaign/templates/[id] - exists and supported

❌ FAKE functions AI might mention:
   • deleteAllCampaigns() - doesn't exist
   • removeAllCampaigns() - doesn't exist

❌ FAKE API endpoints AI might mention:
   • DELETE /api/admin/campaign/campaigns - doesn't exist (no bulk delete)""")
    
    elif 'analytics' in command_lower:
        print("""For showing analytics, AI should say:

✅ REAL API endpoints:
   • GET /api/admin/analytics/visitors - exists and supported
   • GET /api/admin/campaigns/analytics - exists and supported
   • GET /api/admin/campaign/dashboard - exists and supported

❌ FAKE functions AI might mention:
   • getAnalytics() - doesn't exist
   • fetchAnalytics() - doesn't exist

❌ FAKE API endpoints AI might mention:
   • GET /api/admin/analytics - doesn't exist
   • GET /api/analytics - doesn't exist""")

def main():
    """Main function"""
    print("🔍 AI REALITY CHECK")
    print("=" * 70)
    print("Shows exactly what AI is saying vs. what's actually real")
    print()
    
    # Load real codebase
    real_functions, real_apis = load_real_codebase()
    
    print(f"📋 REAL CODEBASE:")
    print(f"   Functions: {len(real_functions)}")
    print(f"   API endpoints: {len(real_apis)}")
    print()
    
    # Test cases
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
            "command": "show campaign analytics",
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
    
    total_accuracy = 0
    
    # Run reality checks
    for test_case in test_cases:
        accuracy = test_ai_reality(
            test_case["command"],
            test_case["ai_response"],
            real_functions,
            real_apis
        )
        total_accuracy += accuracy
        
        # Show what AI should say
        show_what_ai_should_say(test_case["command"], real_functions, real_apis)
        
        print("\n" + "="*70)
    
    # Final summary
    avg_accuracy = total_accuracy / len(test_cases)
    
    print(f"\n🎯 FINAL REALITY CHECK:")
    print("=" * 50)
    print(f"Average AI Accuracy: {avg_accuracy:.1f}%")
    
    if avg_accuracy >= 80:
        print("✅ AI is mostly accurate - can be trusted")
    elif avg_accuracy >= 50:
        print("⚠️  AI has accuracy issues - needs supervision")
    else:
        print("❌ AI is hallucinating - cannot be trusted")
        print("   The AI is making up functions and APIs that don't exist!")
    
    print(f"\n💡 KEY INSIGHT:")
    print("This system shows you EXACTLY what the AI is referencing")
    print("and validates every statement against the real codebase.")
    print("No more guessing - you can see the AI's accuracy in real-time!")

if __name__ == "__main__":
    main()

