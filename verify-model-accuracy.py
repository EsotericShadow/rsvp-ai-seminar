#!/usr/bin/env python3
"""
Verify the fine-tuned model's accuracy against actual codebase
"""

import subprocess
import json
import re
from pathlib import Path

def test_model_direct(prompt, max_tokens=300):
    """Test the model and extract the actual generated text"""
    cmd = [
        "python3", "-m", "mlx_lm", "generate",
        "--model", "Qwen/Qwen2.5-3B-Instruct",
        "--adapter-path", "./rsvp-qwen-lora-m4pro",
        "--prompt", prompt,
        "--max-tokens", str(max_tokens),
        "--temp", "0.7"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            output = result.stdout
            # Extract the generated text after the second "=========="
            if "==========" in output:
                parts = output.split("==========")
                if len(parts) >= 3:
                    generated_text = parts[2].strip()
                    return generated_text
            return output.strip()
        else:
            return f"Error: {result.stderr}"
    except Exception as e:
        return f"Error: {str(e)}"

def verify_against_codebase():
    """Verify model responses against actual codebase"""
    print("🔍 Verifying Model Against Actual Codebase")
    print("=" * 60)
    
    # Test cases with expected real API endpoints and data structures
    test_cases = [
        {
            "name": "Campaign Creation API",
            "prompt": "### Instruction:\nCreate a new email campaign\n\n### Input:\nI want to create a campaign for our tech conference\n\n### Response:",
            "expected_api": "POST /api/admin/campaign/campaigns",
            "expected_fields": ["name", "description", "status", "steps"],
            "real_endpoint": "rsvp-app/src/app/api/admin/campaign/campaigns/route.ts"
        },
        {
            "name": "Email Template API",
            "prompt": "### Instruction:\nCreate an email template\n\n### Input:\nI need a welcome email template\n\n### Response:",
            "expected_api": "POST /api/admin/campaign/templates",
            "expected_fields": ["name", "subject", "htmlBody", "textBody", "meta"],
            "real_endpoint": "rsvp-app/src/app/api/admin/campaign/templates/route.ts"
        },
        {
            "name": "Audience Group API",
            "prompt": "### Instruction:\nCreate an audience group\n\n### Input:\nI need a group for tech professionals\n\n### Response:",
            "expected_api": "POST /api/admin/campaign/groups",
            "expected_fields": ["name", "description", "color", "criteria", "meta"],
            "real_endpoint": "rsvp-app/src/app/api/admin/campaign/groups/route.ts"
        },
        {
            "name": "RSVP Data Structure",
            "prompt": "### Instruction:\nShow me RSVP data\n\n### Input:\nWhat RSVPs do I have?\n\n### Response:",
            "expected_fields": ["fullName", "email", "attendanceStatus", "attendeeCount", "dietaryPreference"],
            "real_schema": "rsvp-app/prisma/schema.prisma"
        },
        {
            "name": "Campaign Schedule API",
            "prompt": "### Instruction:\nSchedule a campaign\n\n### Input:\nI want to schedule my campaign for tomorrow\n\n### Response:",
            "expected_api": "POST /api/admin/campaign/schedules",
            "expected_fields": ["name", "templateId", "groupId", "sendAt", "timeZone"],
            "real_endpoint": "rsvp-app/src/app/api/admin/campaign/schedules/route.ts"
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}/5: {test_case['name']}")
        print(f"📝 Testing: {test_case['prompt'][:80]}...")
        
        # Get model response
        response = test_model_direct(test_case['prompt'], max_tokens=400)
        
        # Analyze accuracy
        accuracy = analyze_accuracy(response, test_case)
        
        result = {
            "test_name": test_case['name'],
            "response": response,
            "accuracy_score": accuracy['score'],
            "found_apis": accuracy['found_apis'],
            "found_fields": accuracy['found_fields'],
            "missing_elements": accuracy['missing_elements'],
            "incorrect_elements": accuracy['incorrect_elements']
        }
        results.append(result)
        
        print(f"📊 Accuracy Score: {accuracy['score']}/10")
        print(f"✅ Found APIs: {', '.join(accuracy['found_apis'])}")
        print(f"✅ Found Fields: {', '.join(accuracy['found_fields'])}")
        if accuracy['missing_elements']:
            print(f"❌ Missing: {', '.join(accuracy['missing_elements'])}")
        if accuracy['incorrect_elements']:
            print(f"⚠️  Incorrect: {', '.join(accuracy['incorrect_elements'])}")
        
        print(f"📄 Response Preview: {response[:150]}...")
    
    # Generate verification report
    print("\n" + "=" * 60)
    print("📊 VERIFICATION REPORT")
    print("=" * 60)
    
    avg_accuracy = sum(r['accuracy_score'] for r in results) / len(results)
    print(f"📈 Average Accuracy: {avg_accuracy:.1f}/10")
    
    print(f"\n🏆 Most Accurate Responses:")
    best_tests = sorted(results, key=lambda x: x['accuracy_score'], reverse=True)[:3]
    for test in best_tests:
        print(f"   • {test['test_name']}: {test['accuracy_score']}/10")
    
    print(f"\n⚠️  Needs Improvement:")
    worst_tests = sorted(results, key=lambda x: x['accuracy_score'])[:3]
    for test in worst_tests:
        print(f"   • {test['test_name']}: {test['accuracy_score']}/10")
    
    # Save detailed results
    with open('verification-results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Detailed results saved to: verification-results.json")
    
    return results

def analyze_accuracy(response, test_case):
    """Analyze how accurate the response is compared to the real codebase"""
    if not response or "Error:" in response:
        return {
            'score': 0,
            'found_apis': [],
            'found_fields': [],
            'missing_elements': test_case.get('expected_api', '') + test_case.get('expected_fields', []),
            'incorrect_elements': []
        }
    
    score = 0
    found_apis = []
    found_fields = []
    missing_elements = []
    incorrect_elements = []
    
    # Check for expected API endpoints
    if 'expected_api' in test_case:
        expected_api = test_case['expected_api']
        if expected_api.lower() in response.lower():
            found_apis.append(expected_api)
            score += 3
        else:
            missing_elements.append(expected_api)
    
    # Check for expected fields
    if 'expected_fields' in test_case:
        for field in test_case['expected_fields']:
            if field.lower() in response.lower():
                found_fields.append(field)
                score += 1
            else:
                missing_elements.append(field)
    
    # Check for realistic API structure
    if 'POST' in response or 'GET' in response:
        score += 1
    if 'json' in response.lower():
        score += 1
    if 'api' in response.lower():
        score += 1
    
    # Check for realistic field names (not made up)
    realistic_fields = ['name', 'email', 'status', 'id', 'createdAt', 'updatedAt']
    unrealistic_fields = ['campaignName', 'emailAddress', 'userStatus']  # Common mistakes
    
    for field in realistic_fields:
        if field in response:
            score += 0.5
    
    for field in unrealistic_fields:
        if field in response:
            incorrect_elements.append(field)
            score -= 0.5
    
    return {
        'score': min(score, 10),
        'found_apis': found_apis,
        'found_fields': found_fields,
        'missing_elements': missing_elements,
        'incorrect_elements': incorrect_elements
    }

if __name__ == "__main__":
    verify_against_codebase()

